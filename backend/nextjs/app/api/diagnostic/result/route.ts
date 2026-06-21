import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/diagnostic/result?userId=<auth-uuid>
// Returns the saved diagnostic result for this user, or null if none exists
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("diagnostic_results")
      .select("*")
      .eq("user_id", userId)
      .single();

    // PGRST116 = no rows found — that's expected for first-time users
    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ result: data ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/diagnostic/result
// Body: { userId, assignedFormat, scores }
// Upserts so retaking the diagnostic updates the cached result
export async function POST(req: NextRequest) {
  try {
    const { userId, assignedFormat, scores } = await req.json();
    if (!userId || !assignedFormat) {
      return NextResponse.json({ error: "userId and assignedFormat required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("diagnostic_results")
      .upsert(
        { user_id: userId, assigned_format: assignedFormat, scores: scores ?? null },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ result: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
