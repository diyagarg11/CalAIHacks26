// Minimal JSON-file persistence with a clear schema/repository layer.
// Structured so swapping to Postgres later is a drop-in: each "table" is an
// array of rows; the exported repo functions are the only access path.
//
// Schema
// ------
// students (existing user record — preferred_format lives HERE):
//   { id, name, email, mode, preferred_format, preferred_format_source,
//     accommodations: [flagKey], ... }
//
// diagnostic_assessments (one row per diagnostic run — its own table):
//   { id, student_id, created_at, status, decided_by, assigned_format,
//     scores: { audio:{...}|null, text:{...}|null, visual:null },
//     accommodation: { applied:[flagKey], mandatedFormat } | null }
//
// content_units (output of the multimodal pipeline, versioned per topic):
//   { id, topic, source_excerpt, created_at, version, modalities:{text,audio,visual,quiz} }

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "data", "db.json");

const SEED = {
  students: [
    { id: 1, name: "Maya Chen",    email: "maya.c@school.edu",  mode: "visual", preferred_format: "visual", preferred_format_source: "diagnostic", accommodations: [] },
    // Liam has a teacher-set accommodation (from an IEP/504) that mandates audio
    // narration, e.g. dyslexia. The diagnostic must be SKIPPED for him and audio
    // assigned directly — the engine can never override an accommodation.
    { id: 2, name: "Liam Patel",   email: "liam.p@school.edu",  mode: "audio",  preferred_format: "audio",  preferred_format_source: "accommodation", accommodations: ["audio_narration_required"] },
    { id: 3, name: "Sofia Reyes",  email: "sofia.r@school.edu", mode: "text",   preferred_format: "text",   preferred_format_source: "diagnostic", accommodations: ["captions_required"] },
  ],
  diagnostic_assessments: [],
  content_units: [],
};

function load() {
  if (!existsSync(DB_PATH)) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify(SEED, null, 2));
    return structuredClone(SEED);
  }
  return JSON.parse(readFileSync(DB_PATH, "utf8"));
}

let db = load();
const flush = () => writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

export const students = {
  all: () => db.students,
  find: (id) => db.students.find((s) => String(s.id) === String(id)),
  setPreferredFormat(id, format, source) {
    const s = students.find(id);
    if (!s) return null;
    s.preferred_format = format;
    s.preferred_format_source = source;
    s.mode = format; // keep legacy field in sync
    flush();
    return s;
  },
};

export const assessments = {
  all: () => db.diagnostic_assessments,
  forStudent: (id) => db.diagnostic_assessments.filter((a) => String(a.student_id) === String(id)),
  insert(row) {
    db.diagnostic_assessments.push(row);
    flush();
    return row;
  },
};

export const content = {
  all: () => db.content_units,
  forTopic: (topic) => db.content_units.filter((c) => c.topic === topic),
  insert(row) {
    const prior = content.forTopic(row.topic).length;
    const stored = { ...row, version: prior + 1 };
    db.content_units.push(stored);
    flush();
    return stored;
  },
};
