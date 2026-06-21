import { NextRequest, NextResponse } from "next/server";
import { speak } from "@/lib/deepgram";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  try {
    const audio = await speak(text);
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    if (err.code === "NO_KEY") return NextResponse.json({ error: "DEEPGRAM_API_KEY not set" }, { status: 503 });
    console.error("tts failed:", err.message);
    return NextResponse.json({ error: "tts failed" }, { status: 502 });
  }
}
