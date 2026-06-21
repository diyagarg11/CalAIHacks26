import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { LearningMode } from "@/lib/supabase";

interface AttemptBody {
  student_id: string;
  quiz_id: string;
  score: number;         // 0–100
  mode_used: LearningMode;
  hints_used?: number;
}

// POST /api/quiz-attempts
export async function POST(req: NextRequest) {
  let body: AttemptBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { student_id, quiz_id, score, mode_used, hints_used = 0 } = body;

  if (!student_id || !quiz_id || score == null || !mode_used) {
    return NextResponse.json({ error: "Missing required fields: student_id, quiz_id, score, mode_used" }, { status: 400 });
  }

  if (score < 0 || score > 100) {
    return NextResponse.json({ error: "score must be between 0 and 100" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("quiz_attempts")
    .insert({ student_id, quiz_id, score, mode_used, hints_used })
    .select()
    .single();

  if (error) {
    console.error("quiz_attempts insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attempt: data }, { status: 201 });
}
