import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const BUCKET = "class-materials";

// POST /api/upload — accepts 1–10 PDFs, stores in Supabase Storage
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];

  const pdfs = files.filter((f) => f.type === "application/pdf");
  if (!pdfs.length) return NextResponse.json({ error: "At least one PDF is required" }, { status: 400 });

  const tooBig = pdfs.find((f) => f.size > MAX_SIZE);
  if (tooBig) return NextResponse.json({ error: `${tooBig.name} exceeds 50 MB limit` }, { status: 400 });

  const results = await Promise.all(
    pdfs.map(async (file) => {
      const safe = file.name.replace(/[^a-z0-9._-]/gi, "_");
      const path = `${Date.now()}-${safe}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: "application/pdf", upsert: false });

      if (error) throw new Error(`Failed to upload ${file.name}: ${error.message}`);

      const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

      return { id: path, name: file.name, size: file.size, url: publicUrl, uploadedAt: new Date().toISOString() };
    })
  );

  return NextResponse.json({ ok: true, files: results }, { status: 201 });
}

// GET /api/upload — list previously uploaded files from Supabase Storage
export async function GET() {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).list("", {
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const files = (data ?? [])
    .filter((f) => f.name.endsWith(".pdf"))
    .map((f) => {
      const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(f.name);
      return { id: f.name, name: f.name.replace(/^\d+-/, ""), size: f.metadata?.size ?? 0, url: publicUrl, uploadedAt: f.created_at };
    });

  return NextResponse.json({ files });
}
