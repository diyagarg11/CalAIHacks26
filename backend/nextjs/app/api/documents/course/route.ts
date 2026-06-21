import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/documents/course?courseId={uuid}
// Returns all documents linked to a course with their chunk counts.
export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId || !UUID_RE.test(courseId)) {
    return NextResponse.json({ documents: [] });
  }

  try {
    const { data: links, error: linkErr } = await supabaseAdmin
      .from("course_documents")
      .select("document_id")
      .eq("course_id", courseId);
    if (linkErr) throw linkErr;
    if (!links?.length) return NextResponse.json({ documents: [] });

    const docIds = links.map((r: { document_id: string }) => r.document_id);

    const { data: docs, error: docErr } = await supabaseAdmin
      .from("documents")
      .select("id, title, file_url, created_at")
      .in("id", docIds)
      .order("created_at", { ascending: false });
    if (docErr) throw docErr;

    const { data: chunks } = await supabaseAdmin
      .from("document_chunks")
      .select("document_id")
      .in("document_id", docIds);

    const chunkCounts: Record<string, number> = {};
    (chunks ?? []).forEach((c: { document_id: string }) => {
      chunkCounts[c.document_id] = (chunkCounts[c.document_id] ?? 0) + 1;
    });

    const documents = (docs ?? []).map((d: any) => ({
      id: d.id,
      title: d.title,
      file_url: d.file_url,
      created_at: d.created_at,
      chunkCount: chunkCounts[d.id] ?? 0,
    }));

    return NextResponse.json({ documents });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
