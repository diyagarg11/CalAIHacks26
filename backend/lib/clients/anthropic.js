import Anthropic from "@anthropic-ai/sdk";

let client = null;

export function getClient() {
  if (client) return client;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  return client;
}

export const hasKey = () => Boolean(process.env.ANTHROPIC_API_KEY);
export const CONTENT_MODEL = process.env.CONTENT_MODEL || "claude-opus-4-8";
