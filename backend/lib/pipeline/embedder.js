import { createHash } from "crypto";
import OpenAI from "openai";
import { getRedis } from "../clients/redis.js";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMS = 1536;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const CACHE_PREFIX = "emb:v1:";

let _openai = null;

function getOpenAI() {
  if (_openai) return _openai;
  if (!process.env.OPENAI_API_KEY) return null;
  _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

export function hasEmbeddings() {
  return !!process.env.OPENAI_API_KEY;
}

function cacheKey(text) {
  return CACHE_PREFIX + createHash("sha256").update(text).digest("hex");
}

/**
 * Embed a single string. Checks Redis cache first; falls back to OpenAI API.
 * @param {string} text
 * @returns {Promise<number[]>} embedding vector of length EMBEDDING_DIMS
 */
export async function embedOne(text) {
  const openai = getOpenAI();
  if (!openai) throw new Error("OPENAI_API_KEY not set");

  const redis = await getRedis();
  const key = cacheKey(text);

  // Cache read
  if (redis) {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMS,
  });
  const vector = response.data[0].embedding;

  // Cache write (fire-and-forget)
  if (redis) {
    redis.set(key, JSON.stringify(vector), { EX: CACHE_TTL_SECONDS }).catch(() => {});
  }

  return vector;
}

/**
 * Write an already-computed embedding back into the Redis cache.
 * Call this after a confirmed DB write so the cache stays warm
 * even if the fire-and-forget write inside embedOne was dropped.
 */
export async function cacheEmbedding(text, vector) {
  const redis = await getRedis();
  if (!redis) return;
  redis.set(cacheKey(text), JSON.stringify(vector), { EX: CACHE_TTL_SECONDS }).catch(() => {});
}

/**
 * Embed a batch of strings, rate-limiting to 20 concurrent calls.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function embedBatch(texts, concurrency = 20) {
  const results = new Array(texts.length);
  let i = 0;

  async function worker() {
    while (i < texts.length) {
      const idx = i++;
      results[idx] = await embedOne(texts[idx]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, texts.length) }, worker);
  await Promise.all(workers);
  return results;
}

const DOC_CHUNK_TTL = 60 * 60 * 48; // 48 hours
const DOC_CHUNK_PREFIX = "doc:v1:";

/**
 * Cache the full list of chunks (with embeddings) for a document in Redis.
 * Key: doc:v1:{documentId}  Value: JSON array of chunk records
 */
export async function cacheDocumentChunks(documentId, chunks) {
  const redis = await getRedis();
  if (!redis) return;
  redis
    .set(`${DOC_CHUNK_PREFIX}${documentId}`, JSON.stringify(chunks), { EX: DOC_CHUNK_TTL })
    .catch(() => {});
}

/**
 * Retrieve cached chunks for a document from Redis.
 * Returns null on a cache miss or when Redis is unavailable.
 */
export async function getDocumentChunks(documentId) {
  const redis = await getRedis();
  if (!redis) return null;
  const raw = await redis.get(`${DOC_CHUNK_PREFIX}${documentId}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Cosine similarity between two equal-length numeric arrays.
 */
export function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export { EMBEDDING_DIMS };
