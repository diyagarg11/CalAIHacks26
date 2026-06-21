import { createHash } from "crypto";
import { Router } from "express";
import { chunkText } from "../lib/pipeline/chunker.js";
import {
  embedBatch,
  embedOne,
  cacheEmbedding,
  cacheDocumentChunks,
  getDocumentChunks,
  cosineSimilarity,
  hasEmbeddings,
} from "../lib/pipeline/embedder.js";
import { getSupabase, hasSupabase } from "../lib/clients/supabase.js";
import { getRedis } from "../lib/clients/redis.js";

export const documentsRouter = Router();

const SEARCH_CACHE_TTL = 60 * 60; // 1 hour

function searchCacheKey(queryVector, documentId, topK) {
  const payload = JSON.stringify({ queryVector, documentId, topK });
  return "search:v1:" + createHash("sha256").update(payload).digest("hex");
}

// ─── Ingest ──────────────────────────────────────────────────────────────────

/**
 * POST /api/documents/ingest
 * Body: { text: string, documentId: string, title?: string }
 *
 * documentId is required — it's the UUID that links chunks to a document row
 * and is used to group chunks for course-level search.
 *
 * Flow:
 *  1. Chunk the text
 *  2. Embed each chunk (Redis read → OpenAI on miss → Redis write)
 *  3. Insert chunks + vectors into Supabase (source of truth)
 *  4. Write-back: re-cache each embedding after confirmed DB write
 *  5. Cache the full chunk list under doc:v1:{documentId} for course search
 */
documentsRouter.post("/ingest", async (req, res) => {
  const { text, documentId, title = "Untitled" } = req.body ?? {};

  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return res.status(400).json({ error: "text is required (min 10 chars)" });
  }
  if (!documentId || typeof documentId !== "string") {
    return res.status(400).json({ error: "documentId is required" });
  }
  if (!hasEmbeddings()) {
    return res.status(503).json({ error: "Embedding pipeline unavailable — set OPENAI_API_KEY" });
  }
  if (!hasSupabase()) {
    return res.status(503).json({ error: "Vector store unavailable — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" });
  }

  try {
    // 1. Chunk
    const chunks = chunkText(text);

    // 2. Embed (Redis checked first; writes to Redis on OpenAI hit)
    const vectors = await embedBatch(chunks.map((c) => c.content));

    // 3. Insert into Supabase
    const rows = chunks.map((chunk, i) => ({
      document_id: documentId,
      title,
      content: chunk.content,
      chunk_index: chunk.index,
      char_start: chunk.charStart,
      char_end: chunk.charEnd,
      embedding: vectors[i],
    }));

    const supabase = getSupabase();
    const { error } = await supabase.from("document_chunks").insert(rows);
    if (error) throw error;

    // 4. Write-back individual embeddings (repairs any dropped cache entries)
    chunks.forEach((chunk, i) => cacheEmbedding(chunk.content, vectors[i]));

    // 5. Cache the full chunk list by documentId so course-search can pull it
    //    from Redis without touching Supabase or re-embedding anything
    const chunkCache = chunks.map((chunk, i) => ({
      document_id: documentId,
      title,
      content: chunk.content,
      chunk_index: chunk.index,
      embedding: vectors[i],
    }));
    cacheDocumentChunks(documentId, chunkCache);

    return res.json({
      ok: true,
      title,
      documentId,
      chunksIngested: chunks.length,
      chunks: chunks.map((c) => ({
        index: c.index,
        charStart: c.charStart,
        length: c.content.length,
        preview: c.content.slice(0, 80),
      })),
    });
  } catch (err) {
    console.error("[ingest]", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ─── Per-document search ──────────────────────────────────────────────────────

/**
 * POST /api/documents/search
 * Body: { query: string, documentId?: string, topK?: number }
 *
 * Standard similarity search against a single document (or all documents).
 * Redis caches result sets by query+params for 1 hour.
 */
documentsRouter.post("/search", async (req, res) => {
  const { query, documentId = null, topK = 5 } = req.body ?? {};

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query is required" });
  }
  if (!hasEmbeddings()) {
    return res.status(503).json({ error: "Embedding pipeline unavailable — set OPENAI_API_KEY" });
  }
  if (!hasSupabase()) {
    return res.status(503).json({ error: "Vector store unavailable — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" });
  }

  try {
    const queryVector = await embedOne(query);

    const redis = await getRedis();
    const sKey = searchCacheKey(queryVector, documentId, topK);

    if (redis) {
      const cached = await redis.get(sKey);
      if (cached) {
        return res.json({ ok: true, query, cached: true, results: JSON.parse(cached) });
      }
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryVector,
      match_document_id: documentId,
      match_count: topK,
    });
    if (error) throw error;

    if (redis) {
      redis.set(sKey, JSON.stringify(data), { EX: SEARCH_CACHE_TTL }).catch(() => {});
    }

    return res.json({ ok: true, query, cached: false, results: data });
  } catch (err) {
    console.error("[search]", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ─── Course-level search ──────────────────────────────────────────────────────

/**
 * POST /api/documents/course-search
 * Body: { query: string, courseId: string, topK?: number }
 *
 * For a given course, pulls all chunks for every attached document from Redis
 * (falling back to Supabase if a document's chunks aren't cached), computes
 * cosine similarity in-process, and returns the top K chunks across all
 * course documents.
 *
 * Flow:
 *  1. Embed the query (Redis-cached)
 *  2. Fetch document IDs for the course from Supabase
 *  3. For each document: try Redis → on miss, fetch from Supabase and populate Redis
 *  4. Score every chunk with cosine similarity, pick top K
 */
documentsRouter.post("/course-search", async (req, res) => {
  const { query, courseId, topK = 5 } = req.body ?? {};

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query is required" });
  }
  if (!courseId || typeof courseId !== "string") {
    return res.status(400).json({ error: "courseId is required" });
  }
  if (!hasEmbeddings()) {
    return res.status(503).json({ error: "Embedding pipeline unavailable — set OPENAI_API_KEY" });
  }
  if (!hasSupabase()) {
    return res.status(503).json({ error: "Vector store unavailable — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" });
  }

  try {
    const supabase = getSupabase();

    // 1. Embed query
    const queryVector = await embedOne(query);

    // 2. Get document IDs attached to this course
    const { data: courseLinks, error: linkErr } = await supabase
      .from("course_documents")
      .select("document_id")
      .eq("course_id", courseId);
    if (linkErr) throw linkErr;
    if (!courseLinks.length) {
      return res.json({ ok: true, query, results: [], message: "No documents attached to this course" });
    }

    const documentIds = courseLinks.map((r) => r.document_id);

    // 3. Fetch chunks for each document — Redis first, Supabase fallback
    const allChunks = [];
    await Promise.all(
      documentIds.map(async (docId) => {
        let chunks = await getDocumentChunks(docId);

        if (!chunks) {
          // Cache miss: load from Supabase and repopulate Redis
          const { data, error } = await supabase
            .from("document_chunks")
            .select("id, document_id, title, content, chunk_index, embedding")
            .eq("document_id", docId)
            .order("chunk_index");
          if (error) throw error;
          chunks = data;
          if (chunks.length) cacheDocumentChunks(docId, chunks);
        }

        allChunks.push(...chunks);
      })
    );

    if (!allChunks.length) {
      return res.json({ ok: true, query, results: [], message: "No chunks found for course documents" });
    }

    // 4. Score with cosine similarity and return top K
    const scored = allChunks
      .map((chunk) => ({
        document_id: chunk.document_id,
        title: chunk.title,
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        similarity: cosineSimilarity(queryVector, chunk.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return res.json({ ok: true, query, courseId, results: scored });
  } catch (err) {
    console.error("[course-search]", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
});

// ─── Status ───────────────────────────────────────────────────────────────────

documentsRouter.get("/status", (_req, res) => {
  res.json({ embeddings: hasEmbeddings(), vectorStore: hasSupabase() });
});
