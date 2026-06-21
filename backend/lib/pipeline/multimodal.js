// The multimodal content pipeline: one teacher-uploaded source becomes four
// packagings of the SAME facts — text, audio, visual, and a quiz with an answer
// key. Nothing new is invented; the model re-packages the provided source.
//
// Uses Claude with structured outputs (output_config.format) so the four
// modalities come back as a validated object — no brittle parsing.

import { getClient, CONTENT_MODEL } from "../clients/anthropic.js";

const MODALITY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    text: {
      type: "object",
      additionalProperties: false,
      description: "Text-mode summary with headers.",
      properties: {
        title: { type: "string" },
        sections: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              heading: { type: "string" },
              body: { type: "string" },
            },
            required: ["heading", "body"],
          },
        },
      },
      required: ["title", "sections"],
    },
    audio: {
      type: "object",
      additionalProperties: false,
      description: "Audio-mode narration script, written for the ear.",
      properties: {
        title: { type: "string" },
        script: { type: "string" },
      },
      required: ["title", "script"],
    },
    visual: {
      type: "object",
      additionalProperties: false,
      description: "Visual-mode slide/diagram walkthrough.",
      properties: {
        title: { type: "string" },
        slides: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              heading: { type: "string" },
              bullets: { type: "array", items: { type: "string" } },
              diagram_hint: { type: "string", description: "Short description of a diagram that would illustrate this slide." },
            },
            required: ["heading", "bullets", "diagram_hint"],
          },
        },
      },
      required: ["title", "slides"],
    },
    quiz: {
      type: "object",
      additionalProperties: false,
      description: "5-10 question quiz with an answer key.",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              q: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correct: { type: "integer", description: "0-based index of the correct option." },
              explanation: { type: "string" },
            },
            required: ["q", "options", "correct", "explanation"],
          },
        },
      },
      required: ["questions"],
    },
  },
  required: ["text", "audio", "visual", "quiz"],
};

const SYSTEM = `You are a content pipeline for a multi-modal learning platform.
You are given ONE source document for a single topic. Re-package the SAME facts
into four formats. Do not invent facts that aren't supported by the source.
- text: a concise summary organized under clear headers.
- audio: a narration script written for the ear (conversational, no visual references).
- visual: a slide/diagram walkthrough; each slide has a heading, terse bullets, and a diagram hint.
- quiz: 5-10 multiple-choice questions with a 0-based correct index and a short explanation each.`;

export async function generateModalities({ topic, source }) {
  const client = getClient();
  if (!client) {
    const err = new Error("ANTHROPIC_API_KEY not set — multimodal generation unavailable.");
    err.code = "NO_KEY";
    throw err;
  }

  const response = await client.messages.create({
    model: CONTENT_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: MODALITY_SCHEMA } },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Topic: ${topic}\n\nSource document:\n"""\n${source}\n"""`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block) throw new Error("No text block in model response.");
  return JSON.parse(block.text);
}
