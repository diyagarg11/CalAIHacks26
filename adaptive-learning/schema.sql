-- ============================================================
-- Adaptive Learning Platform — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Users (teachers and students — extend with Supabase Auth later)
create table public.users (
  id          uuid primary key default gen_random_uuid(),
  role        text not null check (role in ('teacher', 'student')),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Documents uploaded by teachers
create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.users(id) on delete cascade,
  title       text not null,
  file_url    text not null,  -- Supabase Storage path: class-materials/<filename>
  created_at  timestamptz not null default now()
);

-- AI-generated content for each document (one row per document)
create table public.generated_content (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null unique references public.documents(id) on delete cascade,
  summary      text,          -- plain-text summary
  visual       text,          -- Mermaid diagram source
  audio_url    text,          -- Storage path to narration MP3 (optional)
  created_at   timestamptz not null default now()
);

-- Quizzes derived from a document
create table public.quizzes (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  created_at   timestamptz not null default now()
);

-- Individual MCQ questions belonging to a quiz
create table public.quiz_questions (
  id         uuid primary key default gen_random_uuid(),
  quiz_id    uuid not null references public.quizzes(id) on delete cascade,
  question   text not null,
  options    jsonb not null,   -- ["Option A", "Option B", "Option C", "Option D"]
  answer     text not null,    -- exact text of the correct option
  hint       text,
  created_at timestamptz not null default now()
);

-- Student quiz attempts (one row per student per quiz session)
create table public.quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.users(id) on delete cascade,
  quiz_id     uuid not null references public.quizzes(id) on delete cascade,
  score       numeric not null check (score >= 0 and score <= 100),
  mode_used   text not null check (mode_used in ('text', 'audio', 'visual')),
  hints_used  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ── Indexes ─────────────────────────────────────────────────

create index on public.documents(teacher_id);
create index on public.generated_content(document_id);
create index on public.quizzes(document_id);
create index on public.quiz_questions(quiz_id);
create index on public.quiz_attempts(student_id);
create index on public.quiz_attempts(quiz_id);
create index on public.quiz_attempts(created_at desc);

-- ── Storage ─────────────────────────────────────────────────
-- Run after enabling the Storage extension in your Supabase project

insert into storage.buckets (id, name, public)
values ('class-materials', 'class-materials', false)
on conflict (id) do nothing;

-- Allow authenticated teachers to upload
create policy "Teachers can upload materials"
  on storage.objects for insert
  with check (bucket_id = 'class-materials');

-- Allow authenticated users to read
create policy "Authenticated users can read materials"
  on storage.objects for select
  using (bucket_id = 'class-materials');
