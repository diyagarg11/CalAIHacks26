import { ChevronLeft, ArrowRight, Sparkles, Play, Volume2 } from "lucide-react";
import { C, FONT, DISPLAY, MONO, MODES } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Eyebrow } from "../../components/Eyebrow";

function LessonContent({ mode }) {
  if (mode === "text")
    return (
      <div style={{ fontFamily: FONT, fontSize: 16, color: C.ink, lineHeight: 1.7 }}>
        <p style={{ marginTop: 0 }}>
          A <b>linear equation</b> describes a straight-line relationship between two quantities.
          In the form <span style={{ fontFamily: MONO, background: C.textSoft, padding: "1px 6px", borderRadius: 5 }}>y = mx + b</span>,
          the slope <b>m</b> tells you how steep the line is, and <b>b</b> tells you where it crosses the y-axis.
        </p>
        <p>
          To solve for an unknown, keep the equation balanced: whatever you do to one side, do to the other.
          If <span style={{ fontFamily: MONO }}>2x + 3 = 11</span>, subtract 3 from both sides to get
          <span style={{ fontFamily: MONO }}> 2x = 8</span>, then divide by 2 to find <b>x = 4</b>.
        </p>
      </div>
    );
  if (mode === "audio")
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.audioSoft,
          borderRadius: 14, padding: 18 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.audio,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Play size={22} color="#fff" fill="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
              {[14, 26, 18, 32, 22, 30, 12, 28, 20, 34, 16, 24, 30, 18, 26, 14, 22, 32, 20, 28].map((h, i) => (
                <div key={i} style={{ flex: 1, height: h, background: C.audio, opacity: i < 8 ? 1 : 0.32, borderRadius: 2 }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: MONO, fontSize: 12, color: C.sub }}>
              <span>0:38</span><span>2:15</span>
            </div>
          </div>
          <Volume2 size={20} color={C.audio} />
        </div>
        <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, lineHeight: 1.6, marginTop: 16 }}>
          <b style={{ color: C.ink }}>Transcript.</b> "Think of a linear equation as a recipe for a straight line.
          The slope is how fast it climbs, and the intercept is where it begins…"
        </p>
      </div>
    );
  return (
    <div>
      <svg viewBox="0 0 300 200" style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto" }}>
        <defs>
          <pattern id="g" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" fill="none" stroke={C.line} strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="20" y="10" width="260" height="160" fill="url(#g)" rx="8" />
        <line x1="20" y1="90" x2="280" y2="90" stroke={C.faint} strokeWidth="1.5" />
        <line x1="150" y1="10" x2="150" y2="170" stroke={C.faint} strokeWidth="1.5" />
        <line x1="40" y1="150" x2="270" y2="40" stroke={C.visual} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="150" cy="90" r="5" fill={C.visual} />
        <circle cx="210" cy="63" r="5" fill={C.visual} />
        <text x="216" y="58" fontFamily={MONO} fontSize="11" fill={C.ink}>(2, 4)</text>
        <text x="255" y="103" fontFamily={MONO} fontSize="11" fill={C.faint}>x</text>
        <text x="156" y="24" fontFamily={MONO} fontSize="11" fill={C.faint}>y</text>
      </svg>
      <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, lineHeight: 1.6, textAlign: "center", marginTop: 8 }}>
        Each step up the line is the <b style={{ color: C.visual }}>slope</b>. Drag along to see how <b>x</b> and <b>y</b> move together.
      </p>
    </div>
  );
}

export function Lesson({ course, mode, setMode, onQuiz, onBack }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "30px 22px" }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 8 }}><ChevronLeft size={16} /> All courses</Button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 24 }}>{course.emoji}</span>
        <Eyebrow>{course.title} · LESSON 7</Eyebrow>
      </div>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: "2px 0 18px" }}>
        Solving Linear Equations
      </h1>

      <div style={{ display: "inline-flex", background: C.surface, border: `1px solid ${C.line}`,
        borderRadius: 14, padding: 5, gap: 4, marginBottom: 20 }}>
        {Object.values(MODES).map((m) => {
          const on = mode === m.key;
          return (
            <button key={m.key} onClick={() => setMode(m.key)}
              style={{ display: "flex", alignItems: "center", gap: 7, border: "none", cursor: "pointer",
                padding: "9px 15px", borderRadius: 10, fontFamily: FONT, fontWeight: 600, fontSize: 14,
                background: on ? m.color : "transparent", color: on ? "#fff" : C.sub, transition: "all .15s" }}>
              <m.Icon size={16} /> {m.label}
            </button>
          );
        })}
      </div>

      <Card style={{ padding: 26, minHeight: 210 }}>
        <LessonContent mode={mode} />
      </Card>

      <Card style={{ padding: "14px 18px", marginTop: 16, display: "flex", alignItems: "center",
        gap: 10, background: C.brandSoft, border: "none" }}>
        <Sparkles size={18} color={C.brand} />
        <span style={{ fontFamily: FONT, fontSize: 14, color: C.ink }}>
          Found 3 extra practice problems and a related reading for this topic.
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.brand, marginLeft: "auto" }}>via Browserbase</span>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
        <Button onClick={onQuiz}>Check your understanding <ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}
