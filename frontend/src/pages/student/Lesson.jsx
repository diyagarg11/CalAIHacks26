import { ChevronLeft, ArrowRight, Sparkles, Play, Volume2 } from "lucide-react";
import { C, FONT, DISPLAY, MONO, MODES } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Eyebrow } from "../../components/Eyebrow";

function TextContent({ html }) {
  return (
    <div
      style={{ fontFamily: FONT, fontSize: 16, color: C.ink, lineHeight: 1.75 }}
      dangerouslySetInnerHTML={{ __html: html.replace(/<code>/g, `<code style="font-family:${MONO};background:${C.brandSoft};padding:2px 7px;border-radius:5px;font-size:14px">`).replace(/<b>/g, `<b style="color:${C.ink}">`) }}
    />
  );
}

function AudioContent({ transcript }) {
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 16, background: C.audioSoft,
        borderRadius: 14, padding: 18,
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%", background: C.audio,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
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
      <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, lineHeight: 1.65, marginTop: 16 }}>
        <b style={{ color: C.ink }}>Transcript. </b>{transcript}
      </p>
    </div>
  );
}

function VisualContent({ concepts }) {
  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
        gap: 12,
      }}>
        {concepts.map(({ term, definition }) => (
          <div key={term} style={{
            background: C.visualSoft, borderRadius: 13, padding: "16px 14px",
            border: `1px solid ${C.visual}22`,
          }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.visual, marginBottom: 6 }}>
              {term}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.sub, lineHeight: 1.45 }}>
              {definition}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: FONT, fontSize: 13, color: C.faint, marginTop: 14, textAlign: "center" }}>
        Key concepts for this topic — study each term and its meaning.
      </p>
    </div>
  );
}

export function Lesson({ course, topic, mode, setMode, onQuiz, onBack }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "30px 22px" }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 8 }}>
        <ChevronLeft size={16} /> {course.title}
      </Button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{course.emoji}</span>
        <Eyebrow>{course.title} · {topic.title.toUpperCase()}</Eyebrow>
      </div>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: "2px 0 18px" }}>
        {topic.title}
      </h1>

      {/* Mode switcher */}
      <div style={{
        display: "inline-flex", background: C.surface, border: `1px solid ${C.line}`,
        borderRadius: 14, padding: 5, gap: 4, marginBottom: 20,
      }}>
        {Object.values(MODES).map((m) => {
          const on = mode === m.key;
          return (
            <button key={m.key} onClick={() => setMode(m.key)}
              style={{
                display: "flex", alignItems: "center", gap: 7, border: "none", cursor: "pointer",
                padding: "9px 15px", borderRadius: 10, fontFamily: FONT, fontWeight: 600, fontSize: 14,
                background: on ? m.color : "transparent", color: on ? "#fff" : C.sub, transition: "all .15s",
              }}>
              <m.Icon size={16} /> {m.label}
            </button>
          );
        })}
      </div>

      {/* Lesson content */}
      <Card style={{ padding: 26, minHeight: 210 }}>
        {mode === "text"   && <TextContent html={topic.content.text} />}
        {mode === "audio"  && <AudioContent transcript={topic.content.audioTranscript} />}
        {mode === "visual" && <VisualContent concepts={topic.content.concepts} />}
      </Card>

      <Card style={{
        padding: "14px 18px", marginTop: 16, display: "flex", alignItems: "center",
        gap: 10, background: C.brandSoft, border: "none",
      }}>
        <Sparkles size={18} color={C.brand} />
        <span style={{ fontFamily: FONT, fontSize: 14, color: C.ink }}>
          Found {topic.questions.length} practice questions for <b>{topic.title}</b>.
        </span>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
        <Button onClick={onQuiz}>Check your understanding <ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}
