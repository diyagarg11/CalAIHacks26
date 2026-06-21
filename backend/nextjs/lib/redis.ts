import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("[redis] UPSTASH_REDIS_REST_URL or TOKEN not set — Redis features disabled");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
