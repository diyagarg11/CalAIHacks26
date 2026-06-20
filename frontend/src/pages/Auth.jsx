import { useState } from "react";
import { GraduationCap, Users, ArrowRight, ChevronLeft, Mail, Lock, User, Loader2, ShieldCheck } from "lucide-react";
import { C, FONT, DISPLAY, MONO } from "../constants/tokens";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TriMark } from "../components/TriMark";
import { useAuth } from "../auth/AuthProvider";
import { isSupabaseConfigured } from "../lib/supabase";

const ROLE_META = {
  student: { Icon: GraduationCap, label: "Student", color: C.brand },
  teacher: { Icon: Users, label: "Teacher", color: C.visual },
};

const field = {
  display: "flex", alignItems: "center", gap: 10, background: C.paper,
  border: `1px solid ${C.line}`, borderRadius: 11, padding: "12px 14px",
};
const inputStyle = {
  border: "none", background: "transparent", outline: "none",
  fontFamily: FONT, fontSize: 15, color: C.ink, width: "100%",
};

export function Auth({ role, onBack }) {
  const { signIn, signUp, getMfaLevel, listMfaFactors, challengeMfa } = useAuth();
  const meta = ROLE_META[role];

  // "login" | "signup" | "mfa"
  const [step, setStep] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!isSupabaseConfigured) {
      setError("Supabase isn't configured yet — add your keys to frontend/.env (see .env.example).");
      return;
    }
    setBusy(true);

    if (step === "mfa") {
      const { error } = await challengeMfa({ factorId: mfaFactorId, code: totpCode });
      setBusy(false);
      if (error) { setError("Invalid code — try again."); setTotpCode(""); }
      // On success the AuthProvider listener advances the app automatically.
      return;
    }

    if (step === "signup") {
      const { error } = await signUp({ email, password, name, role });
      setBusy(false);
      if (error) { setError(error.message); return; }
      // setNotice("Account created. Check your email to confirm, then sign in.");
      // setStep("login");
      return;
    }

    // step === "login"
    const { error } = await signIn({ email, password });
    if (error) { setBusy(false); setError(error.message); return; }

    // Check whether the account has 2FA enrolled and needs a challenge.
    const { data: levelData } = await getMfaLevel();
    if (levelData?.nextLevel === "aal2" && levelData?.currentLevel === "aal1") {
      const { data: factorsData } = await listMfaFactors();
      const totp = factorsData?.totp?.[0];
      if (totp) {
        setBusy(false);
        setMfaFactorId(totp.id);
        setStep("mfa");
        return;
      }
    }

    setBusy(false);
    // No MFA enrolled — AuthProvider listener advances the app automatically.
  };

  const isMfa = step === "mfa";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <TriMark s={40} />
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: C.ink, lineHeight: 1 }}>Triad</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: 1 }}>LEARN YOUR WAY</div>
        </div>
      </div>

      <Card style={{ width: 380, maxWidth: "100%", padding: 28 }}>
        <button
          onClick={isMfa ? () => { setStep("login"); setTotpCode(""); setError(null); } : onBack}
          style={{ display: "flex", alignItems: "center", gap: 5, border: "none",
            background: "transparent", color: C.sub, fontFamily: FONT, fontSize: 13, fontWeight: 600,
            cursor: "pointer", padding: 0, marginBottom: 16 }}>
          <ChevronLeft size={15} /> {isMfa ? "Back to sign in" : "Choose a different role"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10,
            background: isMfa ? C.brand : meta.color,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isMfa ? <ShieldCheck size={20} color="#fff" /> : <meta.Icon size={20} color="#fff" />}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: 1, textTransform: "uppercase" }}>
            {isMfa ? "Two-factor auth" : `${meta.label} access`}
          </div>
        </div>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.ink, margin: "4px 0 6px" }}>
          {isMfa ? "Enter your 2FA code" : step === "login" ? "Welcome back" : "Create your account"}
        </h1>
        {isMfa && (
          <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, margin: "0 0 18px", lineHeight: 1.5 }}>
            Open your authenticator app and enter the 6-digit code for Triad.
          </p>
        )}

        {/* login / signup toggle — hidden on MFA step */}
        {!isMfa && (
          <div style={{ display: "inline-flex", width: "100%", background: C.paper,
            border: `1px solid ${C.line}`, borderRadius: 11, padding: 4, gap: 4, marginBottom: 18 }}>
            {["login", "signup"].map((m) => {
              const on = step === m;
              return (
                <button key={m} onClick={() => { setStep(m); setError(null); setNotice(null); }}
                  style={{ flex: 1, border: "none", cursor: "pointer", padding: "9px 0", borderRadius: 8,
                    fontFamily: FONT, fontWeight: 600, fontSize: 14, transition: "all .15s",
                    background: on ? meta.color : "transparent", color: on ? "#fff" : C.sub }}>
                  {m === "login" ? "Sign in" : "Sign up"}
                </button>
              );
            })}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isMfa ? (
            <div style={{ ...field, justifyContent: "center" }}>
              <ShieldCheck size={17} color={C.faint} />
              <input
                style={{ ...inputStyle, textAlign: "center", fontSize: 24, fontFamily: MONO,
                  letterSpacing: 8, fontWeight: 700 }}
                placeholder="000000"
                value={totpCode}
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
          ) : (
            <>
              {step === "signup" && (
                <div style={field}>
                  <User size={17} color={C.faint} />
                  <input style={inputStyle} placeholder="Full name" value={name} autoComplete="name"
                    onChange={(e) => setName(e.target.value)} required />
                </div>
              )}
              <div style={field}>
                <Mail size={17} color={C.faint} />
                <input style={inputStyle} type="email" placeholder="Email" value={email} autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div style={field}>
                <Lock size={17} color={C.faint} />
                <input style={inputStyle} type="password" placeholder="Password" value={password} minLength={6}
                  autoComplete={step === "login" ? "current-password" : "new-password"}
                  onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </>
          )}

          {error && (
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.bad, background: C.badSoft,
              borderRadius: 9, padding: "9px 12px" }}>{error}</div>
          )}
          {notice && (
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.good, background: C.visualSoft,
              borderRadius: 9, padding: "9px 12px" }}>{notice}</div>
          )}

          <Button type="submit" color={isMfa ? C.brand : meta.color} disabled={busy || (isMfa && totpCode.length < 6)}
            style={{ width: "100%", justifyContent: "center", marginTop: 4,
              opacity: (busy || (isMfa && totpCode.length < 6)) ? 0.7 : 1 }}>
            {busy ? <Loader2 size={16} className="spin" /> : null}
            {isMfa ? "Verify" : step === "login" ? "Sign in" : "Create account"} <ArrowRight size={16} />
          </Button>
        </form>
      </Card>

      <div style={{ marginTop: 22, fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: 1 }}>
        SECURE LOGIN · SUPABASE · JWT · TOTP 2FA
      </div>
    </div>
  );
}
