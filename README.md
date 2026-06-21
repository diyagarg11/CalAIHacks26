# Triad — multi-modal learning platform

Adaptive learning that teaches each student in the format they actually learn
best (text / audio / visual), measured rather than self-reported.

This repo currently implements two tracks:

- **Frontend** (`frontend/`) — React + Vite prototype of the student & teacher app.
- **Backend** (`backend/`) — Node/Express API for the **initial assessment**
  (the measured diagnostic that sets a new student's starting format) and the
  **multimodal content pipeline** (one teacher source → text / audio / visual / quiz,
  powered by Claude).

## Run it locally

Two processes. The frontend works on its own; the backend adds persistence and
the Claude-powered content pipeline.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # optional: add ANTHROPIC_API_KEY for the content pipeline
npm run dev                 # http://localhost:8787
```

The diagnostic assessment runs **without** an API key. Only
`POST /api/content/generate` (the multimodal pipeline) needs `ANTHROPIC_API_KEY`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The frontend auto-detects the backend at `http://localhost:8787`. If the backend
isn't running, the diagnostic falls back to bundled, client-side scoring so the
demo still works (it'll show an "offline mode" note on the result screen).

---

## The initial assessment (student modeling)

A new student's starting format is a **measured baseline, not a preference**.

1. **Accommodation check first.** Teacher-set flags (from an IEP/504) are
   honored before anything else. A flag that *mandates* a format (e.g. "audio
   narration required") **skips the diagnostic** and assigns that format
   directly — the adaptive engine can never override an accommodation. Flags
   that only *constrain* delivery (captions) or *exclude* one format (no
   flashing → excludes visual) don't block the diagnostic.
2. **Two formats, randomized order.** The same ~90-second neutral lesson ("why
   the sky is blue") is shown as **text** and as **audio**, in random order to
   avoid order bias. The audio narration uses the browser's speech synthesis.
3. **Comprehension quiz after each.** A short quiz follows each format. We show
   **no feedback between formats** — since both formats cover the *same* content,
   revealing answers would let the second quiz be gamed.
4. **Higher score wins.** The format with higher comprehension becomes the
   student's `preferred_format`. Ties break on faster completion.

### Why visual is deferred (not tested in the diagnostic)

We test **audio vs. text** only, and defer **visual** to the student's first real
lessons. Reasoning:

- **Fairness** — audio and text render the *same script*, so the score gap is
  attributable to modality, not content. A visual lesson is inherently different
  content (a diagram), which confounds "is visual better for this student" with
  "was this particular diagram good."
- **Cost** — a fair, neutral visual diagnostic is the most expensive modality to
  author for the least reliable signal.
- **It self-corrects** — the preference signal updates after every real lesson,
  so visual gets measured naturally. We record it as `null` ("untested") so the
  adaptive engine knows to sample it, rather than as a misleading `0`.

### Data model

`preferred_format` lives on the **existing student/user record**. Each diagnostic
run is a row in its own **`diagnostic_assessments`** table (1-to-many, so a
student can be re-assessed):

```
students
  preferred_format         'audio' | 'text' | 'visual'
  preferred_format_source  'diagnostic' | 'accommodation' | 'teacher_override'
  accommodations           [flagKey]

diagnostic_assessments
  id, student_id, created_at
  status           'completed' | 'skipped_accommodation'
  decided_by       'diagnostic' | 'accommodation'
  assigned_format  'audio' | 'text' | 'visual'
  scores           { audio:{correct,total,pct,seconds}, text:{...}, visual:null }
  accommodation    { applied:[flagKey], mandatedFormat } | null
```

`scores` is exactly the baseline the adaptive engine's preference-signal tracker
reads from later (`null` = untested). See `backend/README.md` for the API.
