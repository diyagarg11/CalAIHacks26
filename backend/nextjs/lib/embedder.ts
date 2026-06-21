import { createHash } from "crypto";
import OpenAI from "openai";
import { redis } from "./redis";

const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMS = 1536;
const EMB_TTL = 60 * 60 * 24 * 7;  // 7 days — embeddings are stable
const DOC_TTL = 60 * 60 * 48;       // 48 hours — chunk lists for retrieval

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

export function hasEmbeddings(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

function embKey(text: string): string {
  return `emb:v1:${createHash("sha256").update(text).digest("hex")}`;
}

function docKey(documentId: string): string {
  return `doc:v1:${documentId}`;
}

async function redisGet<T>(key: string): Promise<T | null> {
  try { return await redis.get<T>(key); } catch { return null; }
}

async function redisSet(key: string, value: unknown, ttl: number): Promise<void> {
  try { await redis.set(key, value, { ex: ttl }); } catch { /* non-fatal */ }
}

// ── Embedding ──────────────────────────────────────────────────────────────

export async function embedOne(text: string): Promise<number[]> {
  const cached = await redisGet<number[]>(embKey(text));
  if (cached) return cached;

  const res = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMS,
  });
  const vector = res.data[0].embedding;

  redisSet(embKey(text), vector, EMB_TTL); // fire-and-forget
  return vector;
}

export async function embedBatch(texts: string[], concurrency = 20): Promise<number[][]> {
  const results: number[][] = new Array(texts.length);
  let i = 0;
  async function worker() {
    while (i < texts.length) {
      const idx = i++;
      results[idx] = await embedOne(texts[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, texts.length) }, worker));
  return results;
}

// Write-back after confirmed DB write — repairs any dropped cache entries
export async function cacheEmbedding(text: string, vector: number[]): Promise<void> {
  await redisSet(embKey(text), vector, EMB_TTL);
}

// ── Document chunk cache ───────────────────────────────────────────────────

export interface CachedChunk {
  document_id: string;
  title: string;
  content: string;
  chunk_index: number;
  embedding: number[];
}

export async function cacheDocumentChunks(documentId: string, chunks: CachedChunk[]): Promise<void> {
  await redisSet(docKey(documentId), chunks, DOC_TTL);
}

export async function getDocumentChunks(documentId: string): Promise<CachedChunk[] | null> {
  return redisGet<CachedChunk[]>(docKey(documentId));
}

// ── Similarity ─────────────────────────────────────────────────────────────

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
