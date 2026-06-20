import { ChevronRight, Flame, Award } from "lucide-react";
import { C, FONT, DISPLAY, MONO } from "../../constants/tokens";
import { COURSES } from "../../constants/data";
import { Card } from "../../components/Card";
import { ModeBadge } from "../../components/ModeBadge";

export function StudentHome({ prefs, onOpen }) {
  const top = Object.entries(prefs).sort((a, b) => b[1] - a[1])[0][0];
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: 0 }}>Welcome back, Maya</h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: C.sub, margin: "6px 0 0" }}>
            Your strongest mode right now is <ModeBadge mode={top} /> — lessons open there by default.
          </p>
        </div>
        <Card style={{ padding: "14px 18px", display: "flex", gap: 22 }}>
          {[["Day streak", "6", C.audio, Flame], ["Mastery", "74%", C.visual, Award]].map(([l, v, c, I]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <I size={20} color={c} />
              <div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: C.ink }}>{v}</div>
                <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint }}>{l}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: C.ink, margin: "30px 0 14px" }}>Your courses</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {COURSES.map((c) => (
          <Card key={c.id} style={{ padding: 22, cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
            onClick={() => onOpen(c)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 26px rgba(26,27,46,.09)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 34 }}>{c.emoji}</span>
              <ModeBadge mode={c.mode} size={12} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: C.ink, margin: "14px 0 4px" }}>{c.title}</div>
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint, marginBottom: 16 }}>{c.lessons} lessons</div>
            <div style={{ height: 7, borderRadius: 999, background: C.line, overflow: "hidden" }}>
              <div style={{ width: `${c.progress}%`, height: "100%", background: c.color, borderRadius: 999 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.sub }}>{c.progress}% complete</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: c.color, fontFamily: FONT, fontSize: 13, fontWeight: 600 }}>
                Continue <ChevronRight size={15} />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
