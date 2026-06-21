import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_FORMATS = ["text", "audio", "visual"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { format } = await req.json();

  if (!VALID_FORMATS.includes(format)) {
    return NextResponse.json({ error: "format must be text | audio | visual" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("students")
    .update({ preferred_format: format, preferred_format_source: "teacher_override" })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: "unknown student" }, { status: 404 });
  return NextResponse.json({ student: data });
}
