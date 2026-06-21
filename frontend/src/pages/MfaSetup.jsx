import { useState, useEffect } from "react";
import { ShieldCheck, ShieldOff, ChevronLeft, Loader2, ArrowRight } from "lucide-react";
import { C, FONT, DISPLAY, MONO } from "../constants/tokens";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useAuth } from "../auth/AuthProvider";

const field = {
  display: "flex", alignItems: "center", gap: 10, background: C.paper,
  border: `1px solid ${C.line}`, borderRadius: 11, padding: "12px 14px",
};

export function MfaSetup({ onBack }) {
  const { enrollMfa, confirmMfaEnroll, listMfaFactors, unenrollMfa } = useAuth();

  const [enrolledFactor, setEnrolledFactor] = useState(null);
  const [qr, setQr] = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMfaFactors().then(({ data }) => {
      setEnrolledFactor(data?.totp?.[0] ?? null);
      setLoading(false);
    });
  }, [listMfaFactors]);

  const startEnroll = async () => {
    setBusy(true);
    setError(null);
    const { data, error } = await enrollMfa();
    setBusy(false);
    if (error) { setError(error.message); return; }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
  };

  const confirmEnroll = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await confirmMfaEnroll({ factorId, code });
    setBusy(false);
    if (error) { setError("Invalid code — try again."); setCode(""); return; }
    setQr(null);
    setSuccess("2FA is now active on your account.");
    const { data } = await listMfaFactors();
    setEnrolledFactor(data?.totp?.[0] ?? null);
  };

  const disable = async () => {
    if (!enrolledFactor) return;
    setBusy(true);
    setError(null);
    const { error } = await unenrollMfa(enrolledFactor.id);
    setBusy(false);
    if (error) { setError(error.message); return; }
    setEnrolledFactor(null);
    setSuccess("2FA has been removed from your account.");
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "44px 22px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, border: "none",
        background: "transparent", color: C.sub, fontFamily: FONT, fontSize: 13, fontWeight: 600,
        cursor: "pointer", padding: 0, marginBottom: 22 }}>
        <ChevronLeft size={15} /> Back
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.brand,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldCheck size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: C.ink }}>Two-factor authentication</div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: C.sub }}>TOTP via authenticator app</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 size={24} className="spin" color={C.faint} />
        </div>
      ) : (
        <Card style={{ padding: 24, marginTop: 20 }}>
          {success && (
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.good, background: C.visualSoft,
              borderRadius: 9, padding: "9px 12px", marginBottom: 16 }}>{success}</div>
          )}
          {error && (
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.bad, background: C.badSoft,
              borderRadius: 9, padding: "9px 12px", marginBottom: 16 }}>{error}</div>
          )}

          {enrolledFactor && !qr ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <ShieldCheck size={20} color={C.good} />
                <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink }}>
                  2FA is enabled
                </span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, margin: "0 0 18px", lineHeight: 1.5 }}>
                Your account is protected by a one-time code from your authenticator app on every sign-in.
              </p>
              <Button variant="soft" onClick={disable} disabled={busy}
                style={{ width: "100%", justifyContent: "center", color: C.bad, borderColor: C.bad,
                  opacity: busy ? 0.7 : 1 }}>
                {busy ? <Loader2 size={15} className="spin" /> : <ShieldOff size={15} />} Remove 2FA
              </Button>
            </>
          ) : qr ? (
            <>
              <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, margin: "0 0 16px", lineHeight: 1.5 }}>
                Scan this QR code with <b style={{ color: C.ink }}>Google Authenticator</b>,{" "}
                <b style={{ color: C.ink }}>Authy</b>, or any TOTP app, then enter the 6-digit code to confirm.
              </p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <img src={qr} alt="2FA QR code" style={{ width: 180, height: 180, borderRadius: 12,
                  border: `1px solid ${C.line}` }} />
              </div>
              <form onSubmit={confirmEnroll} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ ...field, justifyContent: "center" }}>
                  <input
                    style={{ border: "none", background: "transparent", outline: "none",
                      fontFamily: MONO, fontSize: 24, color: C.ink, textAlign: "center",
                      letterSpacing: 8, fontWeight: 700, width: "100%" }}
                    placeholder="000000"
                    value={code}
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <Button type="submit" disabled={busy || code.length < 6}
                  style={{ width: "100%", justifyContent: "center",
                    opacity: (busy || code.length < 6) ? 0.7 : 1 }}>
                  {busy ? <Loader2 size={15} className="spin" /> : null}
                  Activate 2FA <ArrowRight size={15} />
                </Button>
              </form>
            </>
          ) : (
            <>
              <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, margin: "0 0 18px", lineHeight: 1.5 }}>
                Add an extra layer of security. After enabling, every sign-in will require a 6-digit
                code from your authenticator app in addition to your password.
              </p>
              <Button onClick={startEnroll} disabled={busy}
                style={{ width: "100%", justifyContent: "center", opacity: busy ? 0.7 : 1 }}>
                {busy ? <Loader2 size={15} className="spin" /> : <ShieldCheck size={15} />} Set up 2FA
              </Button>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
