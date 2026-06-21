import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("students").select("*").eq("id", id).single();

  if (error || !data) return NextResponse.json({ error: "unknown student" }, { status: 404 });
  return NextResponse.json({ student: data });
}
