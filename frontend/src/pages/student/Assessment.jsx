import { ArrowRight } from "lucide-react";
import { C, FONT, DISPLAY, MONO, MODES } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ModeBadge } from "../../components/ModeBadge";
import { Eyebrow } from "../../components/Eyebrow";

export function Assessment({ prefs, setPrefs, onDone }) {
  const top = Object.entries(prefs).sort((a, b) => b[1] - a[1])[0][0];
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "44px 22px" }}>
      <Eyebrow>STEP 1 · YOUR LEARNING PROFILE</Eyebrow>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.ink, margin: "8px 0 6px" }}>
        How do you learn best?
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: C.sub, margin: "0 0 28px" }}>
        Slide each mode to how well it works for you. We'll start with your strongest — then keep
        learning what fits as you go.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {Object.values(MODES).map((m) => {
          const v = prefs[m.key];
          return (
            <Card key={m.key} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: m.soft,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <m.Icon size={20} color={m.color} />
                  </div>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, color: C.ink }}>{m.label}</div>
                    <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint }}>{m.verb}</div>
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: m.color }}>{v}</div>
              </div>
              <input type="range" min={1} max={10} value={v}
                onChange={(e) => setPrefs({ ...prefs, [m.key]: +e.target.value })}
                style={{ width: "100%", accentColor: m.color, cursor: "pointer" }} />
            </Card>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
        <div style={{ fontFamily: FONT, fontSize: 14, color: C.sub }}>
          Starting mode: <ModeBadge mode={top} />
        </div>
        <Button onClick={onDone}>Start learning <ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}
