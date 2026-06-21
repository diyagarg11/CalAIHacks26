import { GraduationCap, Users, ArrowRight } from "lucide-react";
import { C, FONT, DISPLAY, MONO } from "../constants/tokens";
import { Card } from "../components/Card";
import { TriMark } from "../components/TriMark";

export function Landing({ onPick }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 28 }}>
        <TriMark s={120} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.ink, lineHeight: 1 }}>Triad</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: 1.5, marginTop: 3 }}>LEARN YOUR WAY</div>
        </div>
      </div>

      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: C.ink,
        textAlign: "center", maxWidth: 640, lineHeight: 1.08, margin: "0 0 14px" }}>
        One lesson. Three ways to learn it.
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 16, color: C.sub, textAlign: "center",
        maxWidth: 480, margin: "0 0 36px", lineHeight: 1.5 }}>
        Read it, hear it, or see it — Triad adapts every lesson to how each student learns best,
        and shows teachers exactly who needs help.
      </p>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { role: "student", Icon: GraduationCap, label: "I'm a student", sub: "Pick how you learn, then dive in", color: C.brand },
          { role: "teacher", Icon: Users, label: "I'm a teacher", sub: "Upload materials, watch the class grow", color: C.visual },
        ].map(({ role, Icon, label, sub, color }) => (
          <Card key={role} onClick={() => onPick(role)}
            style={{ width: 300, padding: 26, cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 30px rgba(26,27,46,.10)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: color,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icon size={26} color="#fff" />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: C.ink }}>{label}</div>
            <div style={{ fontFamily: FONT, fontSize: 14, color: C.sub, margin: "6px 0 18px" }}>{sub}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color, fontWeight: 600, fontSize: 14, fontFamily: FONT }}>
              Continue with login <ArrowRight size={16} />
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 34, fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: 1 }}>
        SECURE LOGIN · JWT · SSO READY
      </div>
    </div>
  );
}
