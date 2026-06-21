// Backend client for the assessment + content APIs. Falls back to bundled,
// client-side logic when the backend isn't reachable so the demo always runs.

import {
  DIAGNOSTIC_LESSON,
  resolveAccommodation,
  gradeLocal,
  gradeLocalMixed,
  buildBreakdownLocal,
  decideFormat,
} from "../constants/diagnostic.js";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";

async function tryFetch(path, opts) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// Returns { online, skip, order, lesson, accommodation }
export async function getDiagnostic(studentId, accommodationFlags = []) {
  try {
    const data = await tryFetch(`/api/assessment/lesson?studentId=${studentId}`);
    return { online: true, ...data };
  } catch {
    // Offline fallback — resolve accommodation + lesson locally.
    const accommodation = resolveAccommodation(accommodationFlags);
    if (accommodation.mandatedFormat)
      return { online: false, skip: true, reason: "accommodation", mandatedFormat: accommodation.mandatedFormat, accommodation };
    const order = Math.random() < 0.5 ? ["text", "audio"] : ["audio", "text"];
    const formats = {};
    for (const [k, v] of Object.entries(DIAGNOSTIC_LESSON.formats)) {
      const { quiz, ...rest } = v;
      formats[k] = { ...rest, quiz: quiz.map(({ q, options }) => ({ q, options })) };
    }
    const lesson = {
      id: DIAGNOSTIC_LESSON.id,
      topic: DIAGNOSTIC_LESSON.topic,
      estimatedSeconds: DIAGNOSTIC_LESSON.estimatedSeconds,
      formats,
    };
    return { online: false, skip: false, order, accommodation, lesson };
  }
}

// Returns { online, assessment, student }
export async function submitDiagnostic(studentId, results, accommodationFlags = []) {
  try {
    const data = await tryFetch(`/api/assessment/submit`, {
      method: "POST",
      body: JSON.stringify({ studentId, results }),
    });
    return { online: true, ...data };
  } catch {
    // Offline fallback — grade + decide locally.
    const accommodation = resolveAccommodation(accommodationFlags);
    if (accommodation.mandatedFormat) {
      return {
        online: false,
        assessment: {
          status: "skipped_accommodation",
          decided_by: "accommodation",
          assigned_format: accommodation.mandatedFormat,
          scores: { text: null, audio: null, visual: null },
          accommodation: { applied: accommodation.applied, mandatedFormat: accommodation.mandatedFormat },
        },
      };
    }
    const scores = {};
    const breakdown = {};
    for (const f of ["text", "audio"]) {
      const graded = f === "audio" ? gradeLocalMixed(f, results[f]?.answers || []) : gradeLocal(f, results[f]?.answers || []);
      scores[f] = { ...graded, seconds: results[f]?.seconds ?? null, pct: Math.round((graded.correct / graded.total) * 100) };
      breakdown[f] = buildBreakdownLocal(f, results[f]?.answers || []);
    }
    return {
      online: false,
      assessment: {
        status: "completed",
        decided_by: "diagnostic",
        assigned_format: decideFormat(scores),
        scores: { ...scores, visual: null },
        breakdown,
        accommodation: accommodation.applied.length ? { applied: accommodation.applied, mandatedFormat: null } : null,
      },
    };
  }
}
