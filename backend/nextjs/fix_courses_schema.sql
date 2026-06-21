-- Allow courses to be created without a teacher_id FK to public.users
-- (teachers authenticate via Supabase Auth, not public.users)
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_teacher_id_fkey;
ALTER TABLE public.courses ALTER COLUMN teacher_id DROP NOT NULL;
