import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async ({ email, password, name, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    return { data, error };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  // --- MFA helpers ---

  /** Check whether the current session still needs a 2FA challenge. */
  const getMfaLevel = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return { data, error };
  }, []);

  /** Start TOTP enrolment — returns { totp: { qr_code, secret, uri } }. */
  const enrollMfa = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    return { data, error };
  }, []);

  /** Confirm enrolment by verifying the first code from the authenticator app. */
  const confirmMfaEnroll = useCallback(async ({ factorId, code }) => {
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chErr) return { error: chErr };
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: ch.id,
      code,
    });
    return { data, error };
  }, []);

  /** Present the 2FA challenge after a password login. */
  const challengeMfa = useCallback(async ({ factorId, code }) => {
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chErr) return { error: chErr };
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: ch.id,
      code,
    });
    return { data, error };
  }, []);

  /** List all enrolled factors for the current user. */
  const listMfaFactors = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    return { data, error };
  }, []);

  /** Remove an enrolled factor (disables 2FA). */
  const unenrollMfa = useCallback(async (factorId) => {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
    return { data, error };
  }, []);

  const user = session?.user ?? null;
  const role = user?.user_metadata?.role ?? null;
  const name = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? null;

  return (
    <AuthContext.Provider
      value={{
        session, user, role, name, loading,
        signUp, signIn, signOut,
        getMfaLevel, enrollMfa, confirmMfaEnroll, challengeMfa, listMfaFactors, unenrollMfa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
