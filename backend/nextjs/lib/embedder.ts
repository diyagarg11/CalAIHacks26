import { createHash } from "crypto";
import OpenAI from "openai";
import { redis } from "./redis";

const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMS = 1536;
const EMB_TTL = 60 * 60 * 24 * 7;  // 7 days — embeddings are stable
const DOC_TTL = 60 * 60 * 48;       // 48 hours — chunk lists for retrieval

// ── Document chunk interface (declared early so L1 cache can reference it) ─

export interface CachedChunk {
  document_id: string;
  title: string;
  content: string;
  chunk_index: number;
  embedding: number[];
}

// ── In-process L1 caches ──────────────────────────────────────────────────
// These survive for the lifetime of the Next.js server process. They sit in
// front of Upstash Redis so that repeated questions within the same session
// never pay a network round-trip — critical when Redis isn't configured.
const embL1 = new Map<string, number[]>();
const docL1 = new Map<string, CachedChunk[]>();

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
  const key = embKey(text);

  // L1: in-process map (zero latency)
  const l1 = embL1.get(key);
  if (l1) return l1;

  // L2: Upstash Redis (fast network, persistent across restarts)
  const l2 = await redisGet<number[]>(key);
  if (l2) { embL1.set(key, l2); return l2; }

  // L3: OpenAI API
  const res = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMS,
  });
  const vector = res.data[0].embedding;

  embL1.set(key, vector);
  redisSet(key, vector, EMB_TTL); // fire-and-forget
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
  embL1.set(embKey(text), vector);
  await redisSet(embKey(text), vector, EMB_TTL);
}

// ── Document chunk cache ───────────────────────────────────────────────────

export async function cacheDocumentChunks(documentId: string, chunks: CachedChunk[]): Promise<void> {
  docL1.set(documentId, chunks);                        // L1: instant
  redisSet(docKey(documentId), chunks, DOC_TTL);        // L2: fire-and-forget
}

export async function getDocumentChunks(documentId: string): Promise<CachedChunk[] | null> {
  // L1 hit — no network at all
  const l1 = docL1.get(documentId);
  if (l1) return l1;

  // L2 hit — Redis (if configured)
  const l2 = await redisGet<CachedChunk[]>(docKey(documentId));
  if (l2) { docL1.set(documentId, l2); return l2; }

  return null;
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
