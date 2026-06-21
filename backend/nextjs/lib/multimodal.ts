import { getAnthropicClient, CONTENT_MODEL } from "./anthropic";

const MODALITY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    text: {
      type: "object", additionalProperties: false,
      properties: {
        title: { type: "string" },
        sections: { type: "array", items: { type: "object", additionalProperties: false, properties: { heading: { type: "string" }, body: { type: "string" } }, required: ["heading", "body"] } },
      },
      required: ["title", "sections"],
    },
    audio: {
      type: "object", additionalProperties: false,
      properties: { title: { type: "string" }, script: { type: "string" } },
      required: ["title", "script"],
    },
    visual: {
      type: "object", additionalProperties: false,
      properties: {
        title: { type: "string" },
        slides: { type: "array", items: { type: "object", additionalProperties: false, properties: { heading: { type: "string" }, bullets: { type: "array", items: { type: "string" } }, diagram_hint: { type: "string" } }, required: ["heading", "bullets", "diagram_hint"] } },
      },
      required: ["title", "slides"],
    },
    quiz: {
      type: "object", additionalProperties: false,
      properties: {
        questions: { type: "array", items: { type: "object", additionalProperties: false, properties: { q: { type: "string" }, options: { type: "array", items: { type: "string" } }, correct: { type: "integer" }, explanation: { type: "string" } }, required: ["q", "options", "correct", "explanation"] } },
      },
      required: ["questions"],
    },
  },
  required: ["text", "audio", "visual", "quiz"],
};

const SYSTEM = `You are a content pipeline for a multi-modal learning platform.
You are given ONE source document for a single topic. Re-package the SAME facts
into four formats. Do not invent facts not in the source.
- text: concise summary with clear headers.
- audio: narration script written for the ear (conversational, no visual references).
- visual: slide/diagram walkthrough with heading, terse bullets, and a diagram hint per slide.
- quiz: 5-10 MCQ questions with 0-based correct index and a short explanation each.`;

export async function generateModalities({ topic, source }: { topic: string; source: string }) {
  const client = getAnthropicClient();
  if (!client) {
    const err: any = new Error("ANTHROPIC_API_KEY not set — multimodal generation unavailable.");
    err.code = "NO_KEY";
    throw err;
  }

  const response = await client.messages.create({
    model: CONTENT_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" } as any,
    output_config: { format: { type: "json_schema", schema: MODALITY_SCHEMA } } as any,
    system: SYSTEM,
    messages: [{ role: "user", content: `Topic: ${topic}\n\nSource document:\n"""\n${source}\n"""` }],
  });

  const block = response.content.find((b: any) => b.type === "text");
  if (!block) throw new Error("No text block in model response.");
  return JSON.parse((block as any).text);
}
