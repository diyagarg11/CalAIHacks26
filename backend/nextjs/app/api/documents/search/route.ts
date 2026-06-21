import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { embedOne, hasEmbeddings } from "@/lib/embedder";
import { redis } from "@/lib/redis";

const SEARCH_TTL = 60 * 60; // 1 hour

function searchKey(queryVector: number[], documentId: string | null, topK: number): string {
  const payload = JSON.stringify({ queryVector, documentId, topK });
  return `search:v1:${createHash("sha256").update(payload).digest("hex")}`;
}

/**
 * POST /api/documents/search
 * Body: { query: string, documentId?: string, topK?: number }
 *
 * Embeds the query, checks Redis for a cached result set, then falls back to
 * a pgvector cosine similarity search in Supabase. Results are cached for 1 hour.
 */
export async function POST(req: NextRequest) {
  const { query, documentId = null, topK = 5 } = await req.json();

  if (!query || typeof query !== "string")
    return NextResponse.json({ error: "query is required" }, { status: 400 });

  if (!hasEmbeddings())
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 503 });

  try {
    const queryVector = await embedOne(query);
    const sKey = searchKey(queryVector, documentId, topK);

    // Check Redis cache
    try {
      const cached = await redis.get<unknown[]>(sKey);
      if (cached) return NextResponse.json({ ok: true, query, cached: true, results: cached });
    } catch { /* Redis unavailable — proceed to Supabase */ }

    // pgvector similarity search
    const { data, error } = await supabaseAdmin.rpc("match_document_chunks", {
      query_embedding: queryVector,
      match_document_id: documentId,
      match_count: topK,
    });
    if (error) throw error;

    // Cache results
    try { await redis.set(sKey, data, { ex: SEARCH_TTL }); } catch { /* non-fatal */ }

    return NextResponse.json({ ok: true, query, cached: false, results: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
