import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Surfaced clearly in the console so a missing .env is obvious during setup.
if (!url || !anonKey) {
  console.warn(
    "[Triad] Supabase env vars missing. Copy .env.example to .env and fill in " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Supabase → Project Settings → API)."
  );
}

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(url ?? "http://localhost", anonKey ?? "public-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // needed for the OAuth (Google) redirect callback
  },
});
