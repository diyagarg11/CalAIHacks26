import { NextRequest } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase";
import {
  embedOne,
  getDocumentChunks,
  cacheDocumentChunks,
  cosineSimilarity,
  hasEmbeddings,
  CachedChunk,
} from "@/lib/embedder";

const openai = new OpenAI();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// Retrieve top-3 most relevant chunks for this query within the given course.
// Returns a formatted string to inject into the system prompt, or "" if nothing useful.
async function retrieveContext(query: string, courseId: string): Promise<string> {
  try {
    const queryVector = await embedOne(query);

    const { data: links, error: linkErr } = await supabaseAdmin
      .from("course_documents")
      .select("document_id")
      .eq("course_id", courseId);
    if (linkErr || !links?.length) return "";

    const allChunks: CachedChunk[] = [];
    await Promise.all(
      links.map(async (link: { document_id: string }) => {
        let chunks = await getDocumentChunks(link.document_id);
        if (!chunks) {
          const { data, error } = await supabaseAdmin
            .from("document_chunks")
            .select("document_id, title, content, chunk_index, embedding")
            .eq("document_id", link.document_id)
            .order("chunk_index");
          if (error || !data?.length) return;
          chunks = data as CachedChunk[];
          cacheDocumentChunks(link.document_id, chunks);
        }
        allChunks.push(...chunks);
      })
    );

    if (!allChunks.length) return "";

    const top = allChunks
      .map((chunk) => {
        // pgvector may return the embedding column as a "[n,n,...]" string rather than number[]
        const emb: number[] =
          typeof chunk.embedding === "string"
            ? (chunk.embedding as unknown as string).slice(1, -1).split(",").map(Number)
            : chunk.embedding;
        return { chunk, sim: cosineSimilarity(queryVector, emb) };
      })
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3);

    return top
      .map(({ chunk }, i) =>
        `[Source ${i + 1}: ${chunk.title ?? "Document"}]\n${chunk.content.slice(0, 800)}`
      )
      .join("\n\n");
  } catch {
    return ""; // RAG is augmentation — fail silently so chat always works
  }
}

// POST /api/chat
// Body: { message, history, courseId, courseTitle, topics }
// Returns: streaming plain text
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY not set", { status: 503 });
  }

  const { message, history = [], courseId, courseTitle, topics = [] } = await req.json();
  if (!message?.trim()) return new Response("message required", { status: 400 });

  // Only attempt retrieval for real UUID course IDs (not mock slugs like "alg")
  const ragContext =
    courseId && UUID_RE.test(courseId) && hasEmbeddings()
      ? await retrieveContext(message, courseId)
      : "";

  const topicContext = topics
    .map((t: any) => `**${t.title}**: ${t.description}\n${stripHtml(t.content ?? "")}`)
    .join("\n\n");

  const ragSection = ragContext
    ? `\nThe following excerpts from uploaded course materials are directly relevant to the student's question. Prioritize this information when formulating your answer:\n\n${ragContext}\n`
    : "";

  const systemPrompt = `You are an encouraging AI tutor for the course "${courseTitle}".
Students come to you with questions about the topics they are studying.
${ragSection}
Course topics and content:
${topicContext}

Guidelines:
- Be concise — 2 to 4 sentences is usually enough.
- Use plain, clear language; short examples help.
- Be warm and encouraging.
- If a student asks for a quiz answer directly, guide them toward it rather than giving it outright.
- If asked about something outside the course, acknowledge it briefly and relate it back to the course material.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.slice(-10).map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: message },
  ];

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    stream: true,
    max_tokens: 400,
    temperature: 0.6,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
