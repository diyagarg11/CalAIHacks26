import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase";
import {
  embedOne,
  getDocumentChunks,
  cosineSimilarity,
  hasEmbeddings,
  CachedChunk,
} from "@/lib/embedder";

const openai = new OpenAI();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err)
    return String((err as any).message);
  return JSON.stringify(err);
}

// POST /api/documents/module-content
// Body: { documentId, documentTitle, moduleTitle, moduleDescription, moduleType }
// Returns: { lecture: { intro, keyPoints, summary }, questions: [...] }
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 503 });
  }

  const { documentId, documentTitle, moduleTitle, moduleDescription, moduleType } =
    await req.json();

  if (!documentId || !UUID_RE.test(documentId)) {
    return NextResponse.json({ error: "Valid documentId (UUID) required" }, { status: 400 });
  }

  try {
    let content = "";

    // Prefer semantically relevant chunks (cosine search on module description)
    if (hasEmbeddings()) {
      try {
        const queryVector = await embedOne(`${moduleTitle} ${moduleDescription}`);

        let chunks: CachedChunk[] | null = await getDocumentChunks(documentId);
        if (!chunks) {
          const { data } = await supabaseAdmin
            .from("document_chunks")
            .select("document_id, title, content, chunk_index, embedding")
            .eq("document_id", documentId)
            .order("chunk_index");
          chunks = (data ?? []) as CachedChunk[];
        }

        if (chunks.length) {
          content = chunks
            .map((c) => {
              const emb: number[] =
                typeof c.embedding === "string"
                  ? (c.embedding as unknown as string).slice(1, -1).split(",").map(Number)
                  : c.embedding;
              return { content: c.content, sim: cosineSimilarity(queryVector, emb) };
            })
            .sort((a, b) => b.sim - a.sim)
            .slice(0, 8)
            .map((c) => c.content)
            .join("\n\n");
        }
      } catch {
        // fall through to sequential load
      }
    }

    if (!content) {
      const { data } = await supabaseAdmin
        .from("document_chunks")
        .select("content")
        .eq("document_id", documentId)
        .order("chunk_index")
        .limit(12);
      content = ((data ?? []) as { content: string }[]).map((c) => c.content).join("\n\n");
    }

    if (!content) {
      return NextResponse.json(
        { error: "No content found — document may still be embedding" },
        { status: 404 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educator who creates detailed lesson content and varied assessment questions. Return only valid JSON — no markdown fences.",
        },
        {
          role: "user",
          content: `Create full educational content for this student module:

Module title: "${moduleTitle}"
Module description: "${moduleDescription}"
Module type: ${moduleType}
Document: "${documentTitle}"

Source material:
${content.slice(0, 5200)}

Return a JSON object with EXACTLY these fields:
{
  "lecture": {
    "intro": "2-3 sentence introduction explaining what this module covers and why it matters",
    "keyPoints": [
      { "title": "Concept heading (4-6 words)", "content": "2-3 sentences explaining this concept clearly with an example if relevant" },
      ... (3-4 key points total)
    ],
    "summary": "2-3 sentence recap of the most important takeaways from this module"
  },
  "questions": [
    {
      "id": 1,
      "question": "Clear, specific question testing understanding of the material",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Exact text of the correct option from the options array",
      "explanation": "1-2 sentences explaining why this answer is correct and why the others are not"
    },
    ... (4 questions total, varied difficulty — recall, comprehension, application, analysis)
  ]
}`,
        },
      ],
      temperature: 0.35,
      max_tokens: 1400,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}");

    return NextResponse.json({
      lecture: parsed.lecture ?? { intro: "", keyPoints: [], summary: "" },
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
