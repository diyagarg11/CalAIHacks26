import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAccommodation, buildAssessmentRecord, gradeQuiz, gradeQuizMixed, buildBreakdown, DiagnosticFormat } from "@/lib/adaptive";

export async function POST(req: NextRequest) {
  const { studentId, results = {} } = await req.json();
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

  const { data: student, error } = await supabaseAdmin
    .from("students").select("*").eq("id", studentId).single();

  if (error || !student) return NextResponse.json({ error: "unknown student" }, { status: 404 });

  const accommodation = resolveAccommodation(student.accommodations ?? []);
  const scores: Record<string, any> = {};

  if (!accommodation.mandatedFormat) {
    for (const format of ["text", "audio", "visual"] as DiagnosticFormat[]) {
      const r = results[format];
      if (!r) return NextResponse.json({ error: `missing results for ${format}` }, { status: 400 });
      const graded = format === "audio"
        ? gradeQuizMixed(format, r.answers)
        : gradeQuiz(format, r.answers);
      scores[format] = { ...graded, seconds: r.seconds ?? null };
    }
  }

  const record = buildAssessmentRecord({
    studentId: student.id,
    accommodation,
    scores,
    createdAt: new Date().toISOString(),
  });

  const { data: stored } = await supabaseAdmin
    .from("diagnostic_assessments").insert(record).select().single();

  await supabaseAdmin.from("students").update({
    preferred_format: record.assigned_format,
    preferred_format_source: record.decided_by,
  }).eq("id", student.id);

  const breakdown: Record<string, any> = {};
  for (const format of ["text", "audio", "visual"] as DiagnosticFormat[]) {
    if (results[format]) breakdown[format] = buildBreakdown(format, results[format].answers);
  }

  const { data: updatedStudent } = await supabaseAdmin
    .from("students").select("*").eq("id", student.id).single();

  return NextResponse.json({ assessment: { ...stored, breakdown }, student: updatedStudent });
}
