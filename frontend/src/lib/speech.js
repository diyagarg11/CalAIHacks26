// Speech helpers backed by the Deepgram proxy on our backend.
//  - fetchTtsUrl(text): narration audio (object URL) for the audio lesson.
//  - transcribeBlob(blob): spoken answer -> transcript.
//  - matchOptionFromSpeech(transcript, options): map a spoken answer to an MCQ index.

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";

// Returns an object URL for the narrated audio, or null if TTS is unavailable
// (so the caller can fall back to the browser's speech synthesis).
export async function fetchTtsUrl(text) {
  try {
    const res = await fetch(`${BASE}/api/speech/tts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function transcribeBlob(blob) {
  const res = await fetch(`${BASE}/api/speech/transcribe`, {
    method: "POST",
    headers: { "content-type": blob.type || "audio/webm" },
    body: blob,
  });
  if (!res.ok) throw new Error(`transcribe ${res.status}`);
  const data = await res.json();
  return data.transcript || "";
}

const STOP = new Set(
  "the a an of to in is are it its and or for that this with as on at by be was were i my you it's".split(" ")
);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const tokens = (s) => norm(s).split(" ").filter((w) => w && !STOP.has(w));

// Map a free-spoken answer to the closest MCQ option.
// Primary signal: word overlap with the option text (students tend to say the
// actual answer). Secondary: an explicit "option B" / "second" / "the third one"
// cue. Returns -1 if nothing matches confidently.
export function matchOptionFromSpeech(transcript, options) {
  const t = norm(transcript);
  if (!t) return -1;

  // Content overlap
  const heard = new Set(tokens(transcript));
  let best = -1;
  let bestScore = 0;
  options.forEach((opt, i) => {
    const ow = tokens(opt);
    if (!ow.length) return;
    const overlap = ow.filter((w) => heard.has(w)).length;
    const score = overlap / ow.length;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  if (bestScore >= 0.34) return best;

  // Explicit positional cue
  const cue = { a: 0, b: 1, c: 2, d: 3, first: 0, second: 1, third: 2, fourth: 3, one: 0, two: 1, three: 2, four: 3 };
  const m = t.match(/\b(?:option|letter|answer|number|the)?\s*\b(a|b|c|d|first|second|third|fourth|one|two|three|four)\b/);
  if (m && cue[m[1]] < options.length) return cue[m[1]];

  return bestScore > 0 ? best : -1;
}
