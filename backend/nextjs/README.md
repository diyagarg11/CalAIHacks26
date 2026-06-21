# Next.js Backend

Single server for the Triad adaptive learning platform. Replaces the previous Express server entirely.

**One command. One port.**

```bash
cd backend/nextjs
npm run dev    # http://localhost:3000
```

---

## Stack

| Layer | Technology |
|---|---|
| Server | Next.js 16 App Router (API routes) |
| Database | Supabase (Postgres) |
| Cache / State | Upstash Redis |
| AI content | Anthropic Claude |
| Speech | Deepgram (TTS + STT) |

---

## Prerequisites

- **Node.js 18+**
- **Supabase** project — [supabase.com](https://supabase.com) (free)
- **Upstash Redis** database — [console.upstash.com](https://console.upstash.com) (free)

---

## Setup

### 1. Install dependencies

```bash
cd backend/nextjs
npm install
```

### 2. Run the database schema

1. Go to your Supabase project → **SQL Editor** → **New query**
2. Paste all of [`schema.sql`](./schema.sql) and click **Run**

This creates all tables and seeds 3 demo students (Maya, Liam, Sofia).

> If the storage lines at the bottom error, delete them and re-run — the tables still create fine.

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in the values:

**Supabase** — Dashboard → your project → Settings → API Keys
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Upstash Redis** — console.upstash.com → create database → REST API tab
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Optional** (endpoints degrade gracefully without these):
```
ANTHROPIC_API_KEY=sk-ant-...    # enables POST /api/content/generate
DEEPGRAM_API_KEY=...            # enables /api/speech/tts and /transcribe
```

### 4. Start

```bash
npm run dev    # http://localhost:3000
```

### 5. Verify

```
http://localhost:3000/api/health
→ { "status": "ok", "supabase": "connected" }
```

---

## Project structure

```
backend/nextjs/
├── app/
│   └── api/
│       ├── health/              GET  — Supabase connection check
│       ├── assessment/
│       │   ├── lesson/          GET  — diagnostic lesson for a student
│       │   ├── submit/          POST — grade + save diagnostic result
│       │   └── history/[id]/    GET  — past assessments for a student
│       ├── content/
│       │   ├── generate/        POST — source text → text/audio/visual/quiz via Claude
│       │   ├── units/           GET  — stored content units (Redis-cached)
│       │   └── status/          GET  — { multimodalEnabled }
│       ├── speech/
│       │   ├── tts/             POST — { text } → audio/mpeg (Deepgram)
│       │   ├── transcribe/      POST — raw audio → { transcript } (Deepgram)
│       │   └── status/          GET  — { ttsEnabled, sttEnabled }
│       ├── students/
│       │   ├── route.ts         GET  — all students
│       │   ├── [id]/route.ts    GET  — single student
│       │   └── [id]/format/     PATCH — teacher format override
│       ├── quiz-attempts/       POST — save a quiz result
│       └── dashboard/           GET  — analytics per teacher's documents
├── lib/
│   ├── supabase.ts              Supabase clients + types
│   ├── redis.ts                 Upstash Redis client + key helpers
│   ├── anthropic.ts             Anthropic client
│   ├── deepgram.ts              Deepgram TTS + STT
│   ├── adaptive.ts              Diagnostic logic + lesson content (pure, no I/O)
│   └── multimodal.ts            Claude content pipeline
├── schema.sql                   Run once in Supabase SQL Editor
├── .env.local.example           Copy to .env.local
└── .env.local                   Your secrets — never committed
```

---

## API reference

### Assessment

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/assessment/lesson?studentId=<uuid>` | Returns diagnostic lesson or `{skip:true}` if accommodation mandates a format |
| `POST` | `/api/assessment/submit` | `{studentId, results:{text,audio}}` → grades, saves, updates preferred_format |
| `GET` | `/api/assessment/history/<studentId>` | All diagnostic rows for a student |

### Content pipeline (needs `ANTHROPIC_API_KEY`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/content/generate` | `{topic, source}` → text/audio/visual/quiz via Claude; cached in Redis |
| `GET` | `/api/content/units?topic=` | Fetch stored units; Redis-cached |
| `GET` | `/api/content/status` | `{multimodalEnabled}` |

### Speech (needs `DEEPGRAM_API_KEY`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/speech/tts` | `{text}` → `audio/mpeg` |
| `POST` | `/api/speech/transcribe` | Raw audio body → `{transcript}` |
| `GET` | `/api/speech/status` | `{ttsEnabled, sttEnabled}` |

### Students

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/students` | All students |
| `GET` | `/api/students/<id>` | Single student |
| `PATCH` | `/api/students/<id>/format` | `{format}` — teacher override |

### Persistence (Supabase)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/quiz-attempts` | Save student quiz result |
| `GET` | `/api/dashboard?teacher_id=<uuid>` | Avg score per mode per document |

---

## Redis usage

| Key pattern | Content | TTL |
|---|---|---|
| `content:{topic}:latest` | Latest generated content unit | 7 days |
| `student:{id}:state` | Adaptive learning session state | 24 hrs |
| `leaderboard:{courseId}` | Sorted score set | 1 hr |

---

## Demo students (seeded by schema.sql)

| Student | ID | Accommodation | Format |
|---|---|---|---|
| Maya Chen | `11111111-...` | None → runs full diagnostic | visual |
| Liam Patel | `22222222-...` | `audio_narration_required` → skips diagnostic | audio |
| Sofia Reyes | `33333333-...` | `captions_required` (constraint only) → runs diagnostic | text |

---

## Sharing with teammates

Share your `.env.local` values directly so teammates point to the same Supabase + Redis without creating their own accounts.
