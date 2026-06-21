import { NextResponse } from "next/server";
import { hasDeepgramKey } from "@/lib/deepgram";

export async function GET() {
  const enabled = hasDeepgramKey();
  return NextResponse.json({ ttsEnabled: enabled, sttEnabled: enabled });
}
