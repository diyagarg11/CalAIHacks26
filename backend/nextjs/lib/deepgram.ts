const TTS_MODEL = process.env.TTS_MODEL ?? "aura-2-thalia-en";
const STT_MODEL = process.env.STT_MODEL ?? "nova-3";

export const hasDeepgramKey = () => Boolean(process.env.DEEPGRAM_API_KEY);

function requireKey(): string {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    const err: any = new Error("DEEPGRAM_API_KEY not set");
    err.code = "NO_KEY";
    throw err;
  }
  return key;
}

/** text → MP3 audio buffer */
export async function speak(text: string): Promise<Buffer> {
  const key = requireKey();
  const res = await fetch(`https://api.deepgram.com/v1/speak?model=${TTS_MODEL}`, {
    method: "POST",
    headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Deepgram TTS ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

/** audio buffer → transcript string */
export async function transcribeAudio(buffer: Buffer, contentType = "audio/webm"): Promise<string> {
  const key = requireKey();
  const url = `https://api.deepgram.com/v1/listen?model=${STT_MODEL}&smart_format=true&punctuate=true`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Token ${key}`, "Content-Type": contentType },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Deepgram STT ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
}
