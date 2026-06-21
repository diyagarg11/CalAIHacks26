import { createClient } from "redis";

let _client = null;
let _available = null; // cached availability flag

export async function getRedis() {
  if (_client) return _client;

  const url = process.env.REDIS_URL || "redis://localhost:6379";
  const client = createClient({ url });

  client.on("error", () => {}); // swallow to avoid crashing when Redis is absent

  try {
    await client.connect();
    _client = client;
    _available = true;
    console.log("  redis cache:         CONNECTED");
  } catch {
    _available = false;
    console.log("  redis cache:         unavailable (set REDIS_URL to enable)");
  }

  return _available ? _client : null;
}

export function isRedisAvailable() {
  return _available === true;
}
