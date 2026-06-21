import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  // Ping Supabase with a lightweight query
  const { error } = await supabaseAdmin.from("users").select("id").limit(1);

  if (error) {
    return NextResponse.json(
      { status: "error", supabase: "disconnected", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "ok",
    supabase: "connected",
    timestamp: new Date().toISOString(),
  });
}
