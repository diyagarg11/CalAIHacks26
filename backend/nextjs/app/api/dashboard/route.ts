import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/dashboard?teacher_id=<uuid>
//
// Returns, for each document the teacher owns:
//   - document title
//   - average score per learning mode (text / audio / visual)
//   - total attempt count
//   - per-student breakdown (student_id, avg score, last seen)
export async function GET(req: NextRequest) {
  const teacherId = req.nextUrl.searchParams.get("teacher_id");
  if (!teacherId) {
    return NextResponse.json({ error: "teacher_id query param required" }, { status: 400 });
  }

  // 1. All documents for this teacher
  const { data: docs, error: docsErr } = await supabaseAdmin
    .from("documents")
    .select("id, title")
    .eq("teacher_id", teacherId);

  if (docsErr) return NextResponse.json({ error: docsErr.message }, { status: 500 });
  if (!docs?.length) return NextResponse.json({ documents: [] });

  const docIds = docs.map((d) => d.id);

  // 2. All quiz attempts joined through quizzes → documents
  const { data: attempts, error: attErr } = await supabaseAdmin
    .from("quiz_attempts")
    .select(`
      score,
      mode_used,
      hints_used,
      created_at,
      student_id,
      quizzes!inner ( document_id )
    `)
    .in("quizzes.document_id", docIds);

  if (attErr) return NextResponse.json({ error: attErr.message }, { status: 500 });

  // 3. Aggregate in JS (fast enough for hackathon scale)
  const modes = ["text", "audio", "visual"] as const;

  const result = docs.map((doc) => {
    const docAttempts = (attempts ?? []).filter(
      (a: any) => a.quizzes?.document_id === doc.id
    );

    // Average score per mode
    const byMode = Object.fromEntries(
      modes.map((m) => {
        const modeAttempts = docAttempts.filter((a: any) => a.mode_used === m);
        const avg = modeAttempts.length
          ? Math.round(modeAttempts.reduce((s: number, a: any) => s + a.score, 0) / modeAttempts.length)
          : null;
        return [m, { avg_score: avg, count: modeAttempts.length }];
      })
    );

    // Per-student breakdown
    const studentMap = new Map<string, { scores: number[]; last_seen: string }>();
    for (const a of docAttempts as any[]) {
      const entry = studentMap.get(a.student_id) ?? { scores: [], last_seen: a.created_at };
      entry.scores.push(a.score);
      if (a.created_at > entry.last_seen) entry.last_seen = a.created_at;
      studentMap.set(a.student_id, entry);
    }

    const students = Array.from(studentMap.entries()).map(([student_id, { scores, last_seen }]) => ({
      student_id,
      avg_score: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
      attempt_count: scores.length,
      last_seen,
    }));

    return {
      document_id: doc.id,
      title: doc.title,
      total_attempts: docAttempts.length,
      by_mode: byMode,
      students,
    };
  });

  return NextResponse.json({ documents: result });
}
