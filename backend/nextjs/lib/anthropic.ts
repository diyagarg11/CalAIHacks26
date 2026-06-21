import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic | null {
  if (_client) return _client;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  _client = new Anthropic();
  return _client;
}

export const hasAnthropicKey = () => Boolean(process.env.ANTHROPIC_API_KEY);
export const CONTENT_MODEL = process.env.CONTENT_MODEL ?? "claude-opus-4-8";
