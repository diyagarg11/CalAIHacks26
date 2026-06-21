import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAccommodation, publicLesson } from "@/lib/adaptive";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

  const { data: student, error } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();

  if (error || !student) return NextResponse.json({ error: "unknown student" }, { status: 404 });

  const accommodation = resolveAccommodation(student.accommodations ?? []);

  if (accommodation.mandatedFormat) {
    return NextResponse.json({ skip: true, reason: "accommodation", mandatedFormat: accommodation.mandatedFormat, accommodation });
  }

  const order = (["text", "audio", "visual"] as const).slice().sort(() => Math.random() - 0.5);
  return NextResponse.json({ skip: false, order, accommodation, lesson: publicLesson() });
}
