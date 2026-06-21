# Triad backend

Node/Express API. JSON-file persistence (`data/db.json`, auto-seeded) behind a
small repository layer in `db.js` so it can be swapped for Postgres without
touching the routes.

```bash
npm install
cp .env.example .env     # ANTHROPIC_API_KEY optional (only for content generation)
npm run dev              # http://localhost:8787, restarts on change
```

## Layout

```
server.js                 Express app + route mounting
db.js                     schema + repository (students, diagnostic_assessments, content_units)
lib/diagnostic.js         accommodation resolution + format decision (pure, testable)
lib/diagnosticLesson.js   the neutral diagnostic lesson + server-side grading
lib/multimodal.js         Claude pipeline: one source -> {text, audio, visual, quiz}
lib/anthropic.js          Claude client (claude-opus-4-8, adaptive thinking)
routes/assessment.js      GET /lesson, POST /submit, GET /history/:id
routes/content.js         POST /generate, GET /units, GET /status
routes/students.js        GET, GET /:id, PATCH /:id/format (teacher override)
```

## API

### Assessment

| Method | Path | Notes |
|---|---|---|
| GET  | `/api/assessment/lesson?studentId=1` | Returns `{skip,order,lesson,accommodation}`. `skip:true` when an accommodation mandates a format. `order` is randomized. Quiz is returned **without** the answer key. |
| POST | `/api/assessment/submit` | Body `{studentId, results:{text:{answers,seconds}, audio:{answers,seconds}}}`. Grades server-side, decides the format, persists a `diagnostic_assessments` row, writes `preferred_format` onto the student. |
| GET  | `/api/assessment/history/:studentId` | All diagnostic rows for a student (adaptive-engine baseline). |

### Multimodal content pipeline (needs `ANTHROPIC_API_KEY`)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/content/generate` | Body `{topic, source}`. One source → `{text, audio, visual, quiz}` via Claude structured outputs; versioned per topic. Returns 503 if no key is set. |
| GET  | `/api/content/units?topic=` | Stored content units (versioned). |
| GET  | `/api/content/status` | `{multimodalEnabled}`. |

### Speech (Deepgram — needs `DEEPGRAM_API_KEY`)

The key stays server-side; the frontend only talks to these proxy endpoints.

| Method | Path | Notes |
|---|---|---|
| POST | `/api/speech/tts` | Body `{text}` → `audio/mpeg` (Aura voice). Powers the audio-lesson narration. |
| POST | `/api/speech/transcribe` | Raw audio body (any `audio/*` content-type) → `{transcript}` (Nova). Powers spoken quiz answers. |
| GET  | `/api/speech/status` | `{ttsEnabled, sttEnabled}`. |

In the audio half of the diagnostic the student **answers by voice**: the
recording is transcribed and mapped to the nearest multiple-choice option
(`matchOptionFromSpeech` in `frontend/src/lib/speech.js`). Options and answers
are identical to the text quiz — only the input modality changes — so the
audio-vs-text comparison stays fair. If the mic is blocked or no match is found,
the options remain tappable.

### Students

| Method | Path | Notes |
|---|---|---|
| GET   | `/api/students` / `/:id` | |
| PATCH | `/api/students/:id/format` | Body `{format}` — teacher override (`preferred_format_source: "teacher_override"`). |

## Seeded demo students

- **Maya (id 1)** — no accommodation → runs the full audio-vs-text diagnostic.
- **Liam (id 2)** — `audio_narration_required` → diagnostic skipped, audio assigned.
- **Sofia (id 3)** — `captions_required` → a *constraint*, so the diagnostic still runs.

```bash
# diagnostic run
curl -s -X POST localhost:8787/api/assessment/submit -H 'content-type: application/json' \
  -d '{"studentId":1,"results":{"text":{"answers":[1,0,2,1],"seconds":60},"audio":{"answers":[1,0,0,0],"seconds":75}}}'

# multimodal pipeline (requires ANTHROPIC_API_KEY)
curl -s -X POST localhost:8787/api/content/generate -H 'content-type: application/json' \
  -d '{"topic":"Photosynthesis","source":"Plants convert light, water, and CO2 into glucose and oxygen..."}'
```
