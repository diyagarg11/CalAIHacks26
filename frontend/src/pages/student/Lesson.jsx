import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ArrowRight, Sparkles, Play, Pause, Volume2, Loader } from "lucide-react";
import { C, FONT, DISPLAY, MONO, MODES } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Eyebrow } from "../../components/Eyebrow";
import { fetchTtsUrl } from "../../lib/speech";

function TextContent({ html }) {
  return (
    <div
      style={{ fontFamily: FONT, fontSize: 16, color: C.ink, lineHeight: 1.75 }}
      dangerouslySetInnerHTML={{ __html: html.replace(/<code>/g, `<code style="font-family:${MONO};background:${C.brandSoft};padding:2px 7px;border-radius:5px;font-size:14px">`).replace(/<b>/g, `<b style="color:${C.ink}">`) }}
    />
  );
}

function AudioContent({ transcript, autoPlay = false }) {
  const [playing, setPlaying] = useState(false);
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let alive = true;
    let url = null;
    fetchTtsUrl(transcript).then((u) => {
      if (!alive) return;
      if (u) { url = u; setSrc(u); } else { setUseFallback(true); }
      setLoading(false);
      if (autoPlay) {
        if (u) {
          // played via onCanPlayThrough on the <audio> element
        } else {
          const synth = window.speechSynthesis;
          if (synth) {
            const utt = new SpeechSynthesisUtterance(transcript);
            utt.onend = () => { if (alive) setPlaying(false); };
            synth.speak(utt);
            setPlaying(true);
          }
        }
      }
    });
    return () => { alive = false; window.speechSynthesis?.cancel(); if (url) URL.revokeObjectURL(url); };
  }, [transcript, autoPlay]);

  const toggle = () => {
    if (useFallback) {
      const synth = window.speechSynthesis;
      if (!synth) return;
      if (playing) { synth.cancel(); setPlaying(false); return; }
      const u = new SpeechSynthesisUtterance(transcript);
      u.onend = () => setPlaying(false);
      synth.cancel(); synth.speak(u); setPlaying(true);
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause(); else el.play();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.audioSoft, borderRadius: 14, padding: 18 }}>
        <button onClick={toggle} disabled={loading} aria-label={playing ? "Pause" : "Play"}
          style={{ width: 50, height: 50, borderRadius: "50%", background: C.audio, border: "none",
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {loading ? <Loader size={20} color="#fff" className="spin" />
            : playing ? <Pause size={22} color="#fff" fill="#fff" />
            : <Play size={22} color="#fff" fill="#fff" />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
            {[14, 26, 18, 32, 22, 30, 12, 28, 20, 34, 16, 24, 30, 18, 26, 14, 22, 32, 20, 28].map((h, i) => (
              <div key={i} style={{ flex: 1, height: h, background: C.audio, opacity: playing ? 1 : 0.32, borderRadius: 2, transition: "opacity .2s" }} />
            ))}
          </div>
          <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 12, color: C.sub }}>
            {loading ? "Loading narration…" : playing ? "Narrating…" : "Tap play to listen"}
          </div>
        </div>
        <Volume2 size={20} color={C.audio} />
      </div>
      {src && (
        <audio ref={audioRef} src={src} preload="auto"
          onCanPlayThrough={() => { if (autoPlay && audioRef.current) audioRef.current.play(); }}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      )}
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

const SECTION_ORDER = {
  audio:  ["audio", "text", "visual"],
  text:   ["text", "audio", "visual"],
  visual: ["visual", "text", "audio"],
};

export function Lesson({ course, topic, mode, setMode, onQuiz, onBack }) {
  const order = SECTION_ORDER[mode] || ["text", "audio", "visual"];
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "30px 22px" }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 8 }}>
        <ChevronLeft size={16} /> {course.title}
      </Button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{course.emoji}</span>
        <Eyebrow>{course.title} · {topic.title.toUpperCase()}</Eyebrow>
      </div>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: "2px 0 20px" }}>
        {topic.title}
      </h1>

      {/* Multimodal content — ordered by recommended mode, all formats shown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {order.map((key, i) => {
          const m = MODES[key];
          return (
            <Card key={key} style={{ padding: 24, borderTop: `3px solid ${m.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <m.Icon size={15} color={m.color} />
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: m.color, letterSpacing: 0.5 }}>
                  {m.label.toUpperCase()}{i === 0 ? " · RECOMMENDED" : ""}
                </span>
              </div>
              {key === "text"   && <TextContent html={topic.content.text} />}
              {key === "audio"  && <AudioContent transcript={topic.content.audioTranscript} autoPlay={i === 0} />}
              {key === "visual" && <VisualContent concepts={topic.content.concepts} />}
            </Card>
          );
        })}
      </div>

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
