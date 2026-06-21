# Triad — multi-modal learning platform

Adaptive learning that teaches each student in the format they actually learn
best (text / audio / visual), measured rather than self-reported.

This repo has two parts:

- **`frontend/`** — React + Vite student & teacher app (port 5175)
- **`backend/nextjs/`** — Next.js API server: assessment, content pipeline, speech, Supabase + Redis (port 3000)

## Run it locally

Two terminals.

### 1. Backend

Requires a free [Supabase](https://supabase.com) and [Upstash Redis](https://console.upstash.com) account. See [`backend/nextjs/README.md`](./backend/nextjs/README.md) for full setup.

```bash
cd backend/nextjs
npm install
cp .env.local.example .env.local   # fill in Supabase + Redis keys
npm run dev                         # http://localhost:3000
```

Verify: `http://localhost:3000/api/health` → `{"status":"ok","supabase":"connected"}`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The frontend proxies all `/api` calls to the backend on :3000 automatically.

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
