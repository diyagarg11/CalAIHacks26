import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase";

const openai = new OpenAI();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/documents/analyze
// Body: { documentId, title }
// Returns: { objectives: string[], modules: Module[] }
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 503 });
  }

  const { documentId, title } = await req.json();
  if (!documentId || !UUID_RE.test(documentId)) {
    return NextResponse.json({ error: "Valid documentId (UUID) required" }, { status: 400 });
  }

  try {
    const { data: chunks, error } = await supabaseAdmin
      .from("document_chunks")
      .select("content, chunk_index")
      .eq("document_id", documentId)
      .order("chunk_index")
      .limit(15);

    if (error) throw error;
    if (!chunks?.length) {
      return NextResponse.json({ error: "No content found — upload may still be processing" }, { status: 404 });
    }

    const content = (chunks as { content: string }[]).map((c) => c.content).join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert curriculum designer. Extract learning objectives and create student study modules from educational content. Return only a valid JSON object.",
        },
        {
          role: "user",
          content: `Analyze this educational document titled "${title ?? "Untitled"}" and return a JSON object with:
- "objectives": array of 3-5 core learning objectives (each starting with an action verb like "Understand", "Apply", "Analyze", "Evaluate")
- "modules": array of 3-4 student study modules, each with:
  - "title": short module name (4-6 words max)
  - "description": one sentence describing what students will do
  - "type": one of "reading" | "quiz" | "practice" | "discussion"
  - "estimatedMinutes": integer between 10 and 30

Document content:
${content.slice(0, 5500)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 700,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json({
      objectives: Array.isArray(parsed.objectives) ? parsed.objectives : [],
      modules: Array.isArray(parsed.modules) ? parsed.modules : [],
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message :
      (err as any)?.message ?? JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
