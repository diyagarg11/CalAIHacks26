import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.warn("[redis] UPSTASH_REDIS_REST_URL or TOKEN not set — Redis cache disabled, falling back to DB-only mode");
}

// Export a real client when credentials exist, or a no-op stub so imports never throw
export const redis = url && token
  ? new Redis({ url, token })
  : {
      get: async () => null,
      set: async () => "OK",
    } as unknown as Redis;

export const TTL = {
  content: 60 * 60 * 24 * 7, // 7 days  — generated content rarely changes
  studentState: 60 * 60 * 24, // 24 hrs  — adaptive learning session state
  leaderboard: 60 * 60,       // 1 hr    — leaderboard scores
};

export const KEYS = {
  contentByTopic: (topic: string) => `content:${topic}:latest`,
  studentState: (id: string) => `student:${id}:state`,
  leaderboard: (courseId: string) => `leaderboard:${courseId}`,
};
