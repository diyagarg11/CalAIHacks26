import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// POST /api/chat
// Body: { message, history, courseTitle, topics }
// Returns: streaming plain text
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY not set", { status: 503 });
  }

  const { message, history = [], courseTitle, topics = [] } = await req.json();
  if (!message?.trim()) return new Response("message required", { status: 400 });

  const topicContext = topics
    .map((t: any) => `**${t.title}**: ${t.description}\n${stripHtml(t.content ?? "")}`)
    .join("\n\n");

  const systemPrompt = `You are an encouraging AI tutor for the course "${courseTitle}".
Students come to you with questions about the topics they are studying.

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
