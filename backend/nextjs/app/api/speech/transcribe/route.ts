import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/deepgram";

export async function POST(req: NextRequest) {
  const arrayBuffer = await req.arrayBuffer();
  if (!arrayBuffer.byteLength) return NextResponse.json({ error: "empty audio body" }, { status: 400 });

  const contentType = req.headers.get("content-type") ?? "audio/webm";

  try {
    const transcript = await transcribeAudio(Buffer.from(arrayBuffer), contentType);
    return NextResponse.json({ transcript });
  } catch (err: any) {
    if (err.code === "NO_KEY") return NextResponse.json({ error: "DEEPGRAM_API_KEY not set" }, { status: 503 });
    console.error("transcribe failed:", err.message);
    return NextResponse.json({ error: "transcribe failed" }, { status: 502 });
  }
}
