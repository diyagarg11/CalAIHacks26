import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { redis, KEYS } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic");

  if (topic) {
    // Check Redis cache first
    const cached = await redis.get(KEYS.contentByTopic(topic));
    if (cached) return NextResponse.json({ units: [cached], source: "cache" });

    const { data, error } = await supabaseAdmin
      .from("content_units")
      .select("*")
      .eq("topic", topic)
      .order("version", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ units: data });
  }

  const { data, error } = await supabaseAdmin
    .from("content_units")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ units: data });
}
