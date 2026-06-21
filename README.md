# Triad — Adaptive Learning Platform

An AI-powered platform that teaches every student in the format they learn best — **text, audio, or visual** — measured by a diagnostic assessment, not self-reported. Teachers upload materials; the system generates multimodal content and tracks per-student performance.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Next.js 16 App Router (API routes) |
| Database | Supabase (Postgres + Storage) |
| Cache / State | Upstash Redis |
| AI content | Anthropic Claude (`claude-opus-4-8`) |
| AI chat | OpenAI GPT-4o mini |
| Speech | Deepgram (TTS + STT) |

---

## Prerequisites

- **Node.js 18+**
- **Supabase** project — [supabase.com](https://supabase.com) (free tier works)
- **Upstash Redis** database — [console.upstash.com](https://console.upstash.com) (free tier works)
- **OpenAI API key** — for the student AI tutor chatbot
- **Anthropic API key** _(optional)_ — for multimodal content generation
- **Deepgram API key** _(optional)_ — for audio narration + voice quiz answers

---

## Quick start

Open **two terminals**.

### Terminal 1 — Backend (port 3000)

```bash
cd backend/nextjs
npm install
cp .env.local.example .env.local
```

Open `.env.local` and fill in your keys (see [Environment variables](#environment-variables) below), then:

```bash
npm run dev
```

Verify it's working:
```
http://localhost:3000/api/health
→ { "status": "ok", "supabase": "connected" }
```

### Terminal 2 — Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

The frontend automatically proxies all `/api` calls to the backend on :3000 — no extra config needed.

---

## First-time database setup

Before running the backend, you need to create the database tables:

1. Go to your Supabase project → **SQL Editor** → **New query**
2. Paste the entire contents of [`backend/nextjs/schema.sql`](./backend/nextjs/schema.sql)
3. Click **Run**

This creates all tables, indexes, seeds 3 demo students, and sets up the storage bucket for PDF uploads.

---

## Environment variables

All backend environment variables go in `backend/nextjs/.env.local`. Copy from the example file:

```bash
cp backend/nextjs/.env.local.example backend/nextjs/.env.local
```

| Variable | Required | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → Settings → API → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase → Settings → API → Secret key |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash → your DB → REST API tab |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash → your DB → REST API tab |
| `OPENAI_API_KEY` | Yes | platform.openai.com — powers the AI tutor chatbot |
| `ANTHROPIC_API_KEY` | Optional | console.anthropic.com — enables content generation |
| `DEEPGRAM_API_KEY` | Optional | deepgram.com — enables audio narration + voice answers |

> Features degrade gracefully without optional keys — the app still runs, those specific endpoints return a clear error.

---

## Project structure

```
CalAIHacks26/
├── frontend/                  React + Vite app
│   ├── src/
│   │   ├── components/        Shared UI (Button, Card, TopBar, ChatBot…)
│   │   ├── constants/
│   │   │   ├── tokens.js      Design tokens — all colors and fonts
│   │   │   └── data.js        Mock course/topic data
│   │   ├── pages/
│   │   │   ├── Landing.jsx    Role-select screen
│   │   │   ├── student/       Student flow (Assessment, CourseDetail, Lesson, Quiz…)
│   │   │   └── teacher/       Teacher flow (Catalog, Dashboard, StudentDetail…)
│   │   └── lib/
│   │       └── speech.js      TTS + STT helpers (calls /api/speech/*)
│   ├── public/logo.png        App logo
│   └── vite.config.js         Dev server + /api proxy to :3000
│
├── backend/
│   └── nextjs/                Next.js API server
│       ├── app/api/
│       │   ├── health/        GET  — Supabase connection check
│       │   ├── assessment/    Diagnostic lesson + grading + history
│       │   ├── content/       Claude multimodal pipeline
│       │   ├── speech/        Deepgram TTS + STT proxy
│       │   ├── students/      Student CRUD + format override
│       │   ├── quiz-attempts/ Save quiz results
│       │   ├── dashboard/     Teacher analytics
│       │   ├── upload/        PDF upload → Supabase Storage + embeddings
│       │   └── chat/          GPT-4o mini AI tutor (streaming)
│       ├── lib/
│       │   ├── supabase.ts    DB clients + TypeScript types
│       │   ├── redis.ts       Upstash Redis client + key helpers
│       │   ├── anthropic.ts   Anthropic client
│       │   ├── deepgram.ts    Deepgram TTS + STT
│       │   ├── adaptive.ts    Diagnostic logic + lesson content (pure)
│       │   └── multimodal.ts  Claude content pipeline
│       ├── schema.sql         Run once in Supabase SQL Editor
│       └── .env.local.example Copy → .env.local and fill in keys
│
└── Images/                    Logo source assets
```

---

## Demo students (seeded by schema.sql)

| Name | UUID prefix | Accommodation | Assigned format |
|---|---|---|---|
| Maya Chen | `11111111-…` | None → runs full diagnostic | visual |
| Liam Patel | `22222222-…` | `audio_narration_required` → skips diagnostic | audio |
| Sofia Reyes | `33333333-…` | `captions_required` (constraint only) → runs diagnostic | text |

---

## Sharing with teammates

The fastest way to onboard a teammate:

1. Share your `backend/nextjs/.env.local` file directly — they can point to the same Supabase + Redis project without creating their own accounts
2. They run `npm install` in both `frontend/` and `backend/nextjs/`
3. They do **not** need to re-run `schema.sql` if the database is already set up
