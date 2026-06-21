import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Browser / client-component client (uses anon key, respects RLS)
export const supabase = createClient(url, anonKey);

// Server-only admin client (bypasses RLS — never expose to browser)
export const supabaseAdmin = serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : supabase; // fallback to anon in dev if service key isn't set yet

// ── Types ────────────────────────────────────────────────────

export type Role = "teacher" | "student";
export type LearningMode = "text" | "audio" | "visual";

export interface User {
  id: string;
  role: Role;
  name: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  file_url: string;
  course_id: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface GeneratedContent {
  id: string;
  document_id: string;
  summary: string | null;
  visual: string | null;
  audio_url: string | null;
  created_at: string;
}

export interface Quiz {
  id: string;
  document_id: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  answer: string;
  hint: string | null;
}

export interface QuizAttempt {
  id: string;
  student_id: string;
  quiz_id: string;
  score: number;
  mode_used: LearningMode;
  hints_used: number;
  created_at: string;
}
