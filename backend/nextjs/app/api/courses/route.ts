import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) return String((err as any).message);
  return JSON.stringify(err);
}

// GET /api/courses?teacherId={uuid}
export async function GET(req: NextRequest) {
  const teacherId = req.nextUrl.searchParams.get("teacherId");
  if (!teacherId || !UUID_RE.test(teacherId)) {
    return NextResponse.json({ courses: [] });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select("id, title, created_at")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ courses: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

// POST /api/courses
// Body: { title, teacherId }
export async function POST(req: NextRequest) {
  try {
    const { title, teacherId } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

    const insert: Record<string, unknown> = { title: title.trim() };
    if (teacherId && UUID_RE.test(teacherId)) insert.teacher_id = teacherId;

    const { data, error } = await supabaseAdmin
      .from("courses")
      .insert(insert)
      .select("id, title, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ course: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
