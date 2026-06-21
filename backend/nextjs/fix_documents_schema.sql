-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Safe to run multiple times (all statements use IF NOT EXISTS).
-- ============================================================

-- 1. Create the courses table (teacher_id optional — no auth required yet)
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid,                    -- nullable: no auth enforcement yet
  title       text not null,
  created_at  timestamptz not null default now()
);

create index if not exists courses_teacher_id_idx on public.courses (teacher_id);

-- 2. Create the course_documents join table
create table if not exists public.course_documents (
  course_id    uuid not null references public.courses(id) on delete cascade,
  document_id  uuid not null references public.documents(id) on delete cascade,
  added_at     timestamptz not null default now(),
  primary key (course_id, document_id)
);

create index if not exists course_documents_course_id_idx   on public.course_documents (course_id);
create index if not exists course_documents_document_id_idx on public.course_documents (document_id);

-- 3. Fix the documents table to match the upload route
--    (teacher_id was NOT NULL — drop that constraint so uploads work without auth)
alter table public.documents
  alter column teacher_id drop not null;

-- 4. Add course_id and uploaded_by columns (ignore if they already exist)
alter table public.documents
  add column if not exists course_id   uuid references public.courses(id) on delete set null;

alter table public.documents
  add column if not exists uploaded_by uuid;

create index if not exists documents_course_id_idx on public.documents (course_id);

-- 5. Enable the pgvector extension (needed for document_chunks)
create extension if not exists vector;

-- 6. Create document_chunks table for semantic search
create table if not exists public.document_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid references public.documents(id) on delete cascade,
  title        text,
  content      text not null,
  chunk_index  integer not null,
  char_start   integer,
  char_end     integer,
  embedding    vector(1536),
  created_at   timestamptz not null default now()
);

create index if not exists document_chunks_document_id_idx on public.document_chunks (document_id);
create index if not exists document_chunks_chunk_index_idx on public.document_chunks (chunk_index);
