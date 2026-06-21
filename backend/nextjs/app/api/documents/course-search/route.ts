import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  embedOne,
  getDocumentChunks,
  cacheDocumentChunks,
  cosineSimilarity,
  hasEmbeddings,
  CachedChunk,
} from "@/lib/embedder";

/**
 * POST /api/documents/course-search
 * Body: { query: string, courseId: string, topK?: number }
 *
 * For a given course:
 *  1. Embed the query (Redis-cached)
 *  2. Fetch document IDs attached to the course from Supabase
 *  3. For each document, pull its chunk list from Redis (doc:v1:{id}).
 *     On a cache miss, fetch from Supabase and repopulate Redis.
 *  4. Score every chunk with cosine similarity in-process, return top K.
 *
 * This is the primary retrieval endpoint for feeding relevant context
 * to Claude when a student asks a question within a course.
 */
export async function POST(req: NextRequest) {
  const { query, courseId, topK = 5 } = await req.json();

  if (!query || typeof query !== "string")
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  if (!courseId || typeof courseId !== "string")
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  if (!hasEmbeddings())
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 503 });

  try {
    // 1. Embed query
    const queryVector = await embedOne(query);

    // 2. Get document IDs for this course
    const { data: links, error: linkErr } = await supabaseAdmin
      .from("course_documents")
      .select("document_id")
      .eq("course_id", courseId);
    if (linkErr) throw linkErr;
    if (!links?.length)
      return NextResponse.json({ ok: true, query, results: [], message: "No documents in this course" });

    const documentIds = links.map((r: { document_id: string }) => r.document_id);

    // 3. Load chunks — Redis first, Supabase fallback
    const allChunks: CachedChunk[] = [];
    await Promise.all(
      documentIds.map(async (docId: string) => {
        let chunks = await getDocumentChunks(docId);

        if (!chunks) {
          const { data, error } = await supabaseAdmin
            .from("document_chunks")
            .select("document_id, title, content, chunk_index, embedding")
            .eq("document_id", docId)
            .order("chunk_index");
          if (error) throw error;
          chunks = data as CachedChunk[];
          if (chunks.length) cacheDocumentChunks(docId, chunks);
        }

        allChunks.push(...chunks);
      })
    );

    if (!allChunks.length)
      return NextResponse.json({ ok: true, query, results: [], message: "No chunks found" });

    // 4. Score and return top K
    const results = allChunks
      .map((chunk) => ({
        document_id: chunk.document_id,
        title: chunk.title,
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        similarity: cosineSimilarity(queryVector, chunk.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return NextResponse.json({ ok: true, query, courseId, results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
