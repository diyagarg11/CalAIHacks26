import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { chunkText } from "@/lib/chunker";
import {
  embedBatch,
  cacheEmbedding,
  cacheDocumentChunks,
  hasEmbeddings,
} from "@/lib/embedder";

const MAX_SIZE = 50 * 1024 * 1024;
const BUCKET = "class-materials";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const courseId = form.get("courseId") as string | null;
    const uploadedBy = form.get("uploadedBy") as string | null;
    const validCourseId = courseId && UUID_RE.test(courseId) ? courseId : null;

    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (!pdfs.length)
      return NextResponse.json({ error: "At least one PDF is required" }, { status: 400 });

    const tooBig = pdfs.find((f) => f.size > MAX_SIZE);
    if (tooBig)
      return NextResponse.json({ error: `${tooBig.name} exceeds 50 MB limit` }, { status: 400 });

    // Ensure the storage bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.id === BUCKET);
    if (!bucketExists) {
      const { error: bucketErr } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
      if (bucketErr) throw new Error(`Failed to create storage bucket: ${bucketErr.message}`);
    }

    // pdf-parse v2.x uses a class-based API: new PDFParse({ data: buffer })
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require("pdf-parse");

    const results = await Promise.all(
      pdfs.map(async (file) => {
        const title = (form.get("title") as string) || file.name.replace(/\.pdf$/i, "");
        const safe = file.name.replace(/[^a-z0-9._-]/gi, "_");
        const storagePath = `${Date.now()}-${safe}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        // 1. Upload to Supabase Storage
        const { error: uploadErr } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(storagePath, buffer, { contentType: "application/pdf", upsert: false });
        if (uploadErr) throw new Error(`Storage upload failed for ${file.name}: ${uploadErr.message}`);

        const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);

        // 2. Insert document row — retry without optional FK fields on constraint error
        const docInsert: Record<string, unknown> = { title, file_url: publicUrl };
        if (validCourseId) docInsert.course_id = validCourseId;
        if (uploadedBy) docInsert.uploaded_by = uploadedBy;

        let { data: docRow, error: docErr } = await supabaseAdmin
          .from("documents")
          .insert(docInsert)
          .select("id")
          .single();

        // Retry with progressively fewer fields if the insert fails due to
        // unknown columns (schema not yet migrated) or FK violations.
        if (docErr) {
          const fallbacks = [
            { title, file_url: publicUrl, course_id: validCourseId || undefined },
            { title, file_url: publicUrl },
          ];
          for (const fallback of fallbacks) {
            const { data: r, error: e } = await supabaseAdmin
              .from("documents").insert(fallback).select("id").single();
            if (!e && r) { docRow = r; docErr = null; break; }
            docErr = e;
          }
        }
        if (docErr || !docRow) throw new Error(`Document insert failed: ${docErr?.message}`);

        const documentId = docRow.id as string;

        // 3. Link to course (only for real UUIDs)
        if (validCourseId) {
          const { error: linkErr } = await supabaseAdmin
            .from("course_documents")
            .insert({ course_id: validCourseId, document_id: documentId });
          if (linkErr) console.warn(`[upload] course_documents link failed:`, linkErr.message);
        }

        // 4–7. Chunk → embed → store (errors logged but never fail the upload)
        let chunksEmbedded = 0;
        if (hasEmbeddings()) {
          try {
            const parser = new PDFParse({ data: buffer });
            const parsed = await parser.getText();
            const text: string = parsed?.text ?? "";
            const chunks = chunkText(text);

            if (chunks.length) {
              const vectors = await embedBatch(chunks.map((c) => c.content));

              // pgvector requires the embedding as a bracketed string "[0.1,0.2,...]"
              const rows = chunks.map((chunk, i) => ({
                document_id: documentId,
                title,
                content: chunk.content,
                chunk_index: chunk.index,
                char_start: chunk.charStart,
                char_end: chunk.charEnd,
                embedding: `[${vectors[i].join(",")}]`,
              }));

              const { error: chunkErr } = await supabaseAdmin
                .from("document_chunks")
                .insert(rows);

              if (chunkErr) {
                console.error(`[embed] document_chunks insert failed:`, chunkErr.message);
              } else {
                chunksEmbedded = chunks.length;
                // Write-back to Redis cache (fire-and-forget)
                chunks.forEach((chunk, i) => cacheEmbedding(chunk.content, vectors[i]));
                cacheDocumentChunks(documentId, chunks.map((chunk, i) => ({
                  document_id: documentId,
                  title,
                  content: chunk.content,
                  chunk_index: chunk.index,
                  embedding: vectors[i],
                })));
              }
            }
          } catch (embErr) {
            console.error(`[embed] ${file.name}:`, embErr);
          }
        }

        return {
          id: documentId,
          name: file.name,
          title,
          size: file.size,
          url: publicUrl,
          chunksEmbedded,
          uploadedAt: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ ok: true, files: results }, { status: 201 });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[upload] unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/upload — list uploaded files from Supabase Storage
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).list("", {
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const files = (data ?? [])
      .filter((f) => f.name.endsWith(".pdf"))
      .map((f) => {
        const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(f.name);
        return {
          id: f.name,
          name: f.name.replace(/^\d+-/, ""),
          size: f.metadata?.size ?? 0,
          url: publicUrl,
          uploadedAt: f.created_at,
        };
      });

    return NextResponse.json({ files });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
