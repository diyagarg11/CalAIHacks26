import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

const client = new Anthropic();

const VALID_FLAGS = [
  "audio_preferred",
  "visual_aids",
  "extended_time",
  "chunked_instructions",
  "verbal_response_ok",
  "reduced_complexity",
  "frequent_breaks",
  "text_preferred",
  "repeat_instructions",
  "reduced_distractions",
  "audio_narration_required",
  "captions_required",
  "no_flashing",
];

const SYSTEM_PROMPT = `You are an educational psychologist assistant that extracts structured accommodation data from IEP (Individualized Education Program) documents. You return only valid JSON — no prose, no markdown fences.`;

const USER_PROMPT = `
Extract accommodation flags from this IEP document and return a JSON object with exactly this shape:

{
  "flags": string[],
  "notes": string,
  "recommended_mode": "audio" | "text" | "visual" | null,
  "weight_adjustments": { "audio": number, "text": number, "visual": number }
}

Rules:
- "flags" must only contain values from this list: ${VALID_FLAGS.join(", ")}
- Only include a flag if it is clearly supported by the document
- "notes" is a 1–2 sentence plain-English summary of the key accommodations
- "recommended_mode" is the primary learning channel if one is specified, otherwise null
- "weight_adjustments" are integers 1–10 representing how much to weight each modality (5 = neutral baseline)
`.trim();

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const studentId = form.get("studentId") as string | null;

  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "A PDF file is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  // Send PDF directly to Claude — works for both text-based and scanned PDFs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const message = await (client.beta.messages.create as any)({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    betas: ["pdfs-2024-09-25"],
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
        { type: "text", text: USER_PROMPT },
      ],
    }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: {
    flags: string[];
    notes: string;
    recommended_mode: string | null;
    weight_adjustments: Record<string, number>;
  };

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    parsed = JSON.parse(jsonMatch[0]);
    parsed.flags = (parsed.flags ?? []).filter((f: string) => VALID_FLAGS.includes(f));
  } catch {
    return NextResponse.json({ error: "Could not parse Claude response", raw }, { status: 500 });
  }

  if (studentId) {
    try {
      await supabaseAdmin
        .from("student_iep")
        .upsert({
          student_id: studentId,
          flags: parsed.flags,
          notes: parsed.notes,
          recommended_mode: parsed.recommended_mode,
          weight_adjustments: parsed.weight_adjustments,
        });
    } catch {
      // Non-fatal — table may not exist yet
    }
  }

  return NextResponse.json({ ok: true, ...parsed });
}

// GET /api/iep/parse?studentId=<id> — retrieve stored IEP flags for a student
export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("student_iep")
    .select("flags, notes, recommended_mode, weight_adjustments")
    .eq("student_id", studentId)
    .single();

  if (error) return NextResponse.json({ flags: [], notes: null }, { status: 200 });
  return NextResponse.json(data);
}
