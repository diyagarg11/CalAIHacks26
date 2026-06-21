import { NextResponse } from "next/server";
import { hasAnthropicKey } from "@/lib/anthropic";

export async function GET() {
  return NextResponse.json({ multimodalEnabled: hasAnthropicKey() });
}
