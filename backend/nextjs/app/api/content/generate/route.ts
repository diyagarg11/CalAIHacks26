import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { redis, KEYS, TTL } from "@/lib/redis";
import { generateModalities } from "@/lib/multimodal";

export async function POST(req: NextRequest) {
  const { topic, source } = await req.json();
  if (!topic || !source) return NextResponse.json({ error: "topic and source are required" }, { status: 400 });

  try {
    const modalities = await generateModalities({ topic, source });

    // Get current version count for this topic
    const { count } = await supabaseAdmin
      .from("content_units")
      .select("*", { count: "exact", head: true })
      .eq("topic", topic);

    const { data: stored } = await supabaseAdmin
      .from("content_units")
      .insert({ topic, source_excerpt: source.slice(0, 280), version: (count ?? 0) + 1, modalities })
      .select()
      .single();

    // Cache the latest version in Redis
    await redis.set(KEYS.contentByTopic(topic), stored, { ex: TTL.content });

    return NextResponse.json({ content: stored });
  } catch (err: any) {
    if (err.code === "NO_KEY") {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not set — set it in backend/nextjs/.env.local to enable this endpoint." },
        { status: 503 }
      );
    }
    console.error("content generation failed:", err);
    return NextResponse.json({ error: "generation failed", detail: err.message }, { status: 500 });
  }
}
