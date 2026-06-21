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

/**
 * POST /api/upload
 * Form fields:
 *   files      — one or more PDF files (required)
 *   courseId   — UUID of the course this document belongs to (required for retrieval)
 *   uploadedBy — UUID of the uploading user (required)
 *   title      — optional; defaults to the filename
 *
 * Flow per file:
 *  1. Upload PDF buffer to Supabase Storage
 *  2. Insert a row into `documents` table
 *  3. Link to course via `course_documents`
 *  4. Extract text from PDF with pdf-parse
 *  5. Chunk → embed (OpenAI text-embedding-3-small, Redis-cached)
 *  6. Insert chunks + vectors into `document_chunks` (Supabase/pgvector)
 *  7. Write-back: cache embeddings + full chunk list in Redis
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const courseId = form.get("courseId") as string | null;
  const uploadedBy = form.get("uploadedBy") as string | null;

  const pdfs = files.filter((f) => f.type === "application/pdf");
  if (!pdfs.length)
    return NextResponse.json({ error: "At least one PDF is required" }, { status: 400 });

  const tooBig = pdfs.find((f) => f.size > MAX_SIZE);
  if (tooBig)
    return NextResponse.json({ error: `${tooBig.name} exceeds 50 MB limit` }, { status: 400 });

  // pdf-parse is a CJS module — require() is the reliable path in server routes
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");

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

      // 2. Insert document row
      const docInsert: Record<string, unknown> = { title, file_url: publicUrl };
      if (courseId) docInsert.course_id = courseId;
      if (uploadedBy) docInsert.uploaded_by = uploadedBy;

      const { data: docRow, error: docErr } = await supabaseAdmin
        .from("documents")
        .insert(docInsert)
        .select("id")
        .single();
      if (docErr) throw new Error(`Document insert failed: ${docErr.message}`);

      const documentId = docRow.id as string;

      // 3. Link to course
      if (courseId) {
        await supabaseAdmin
          .from("course_documents")
          .insert({ course_id: courseId, document_id: documentId })
          .throwOnError();
      }

      // 4–7. Embed and store (non-blocking — don't fail the upload if embedding errors)
      if (hasEmbeddings()) {
        try {
          const { text } = await pdfParse(buffer);

          const chunks = chunkText(text);
          if (chunks.length) {
            const vectors = await embedBatch(chunks.map((c) => c.content));

            // Insert chunks into Supabase
            const rows = chunks.map((chunk, i) => ({
              document_id: documentId,
              title,
              content: chunk.content,
              chunk_index: chunk.index,
              char_start: chunk.charStart,
              char_end: chunk.charEnd,
              embedding: vectors[i],
            }));
            await supabaseAdmin.from("document_chunks").insert(rows).throwOnError();

            // Write-back to Redis
            chunks.forEach((chunk, i) => cacheEmbedding(chunk.content, vectors[i]));
            cacheDocumentChunks(documentId, chunks.map((chunk, i) => ({
              document_id: documentId,
              title,
              content: chunk.content,
              chunk_index: chunk.index,
              embedding: vectors[i],
            })));
          }
        } catch (embErr) {
          // Log but don't fail — the file is stored; embedding can be retried
          console.error(`[embed] ${file.name}:`, embErr);
        }
      }

      return {
        id: documentId,
        name: file.name,
        title,
        size: file.size,
        url: publicUrl,
        chunksEmbedded: hasEmbeddings(),
        uploadedAt: new Date().toISOString(),
      };
    })
  );

  return NextResponse.json({ ok: true, files: results }, { status: 201 });
}

// GET /api/upload — list uploaded files from Supabase Storage
export async function GET() {
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
}
