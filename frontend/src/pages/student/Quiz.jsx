import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ArrowRight, Lightbulb, Check, X, Mic, Square, Loader, Volume2 } from "lucide-react";
import { C, FONT, DISPLAY, MONO, MODES } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Eyebrow } from "../../components/Eyebrow";
import { transcribeBlob } from "../../lib/speech";

function speakInstant(text) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  synth.speak(new SpeechSynthesisUtterance(text));
}

function pickMode(prefs, last = null) {
  const entries = Object.entries(prefs);
  const eligible = entries.length > 1 && last ? entries.filter(([m]) => m !== last) : entries;
  const total = eligible.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [m, w] of eligible) { r -= w; if (r <= 0) return m; }
  return eligible[eligible.length - 1][0];
}

// Keyword overlap grader for voice answers
const STOP = new Set("the a an of to in is are it its and or for that this with as on at by be was were i my you".split(" "));
const toks = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(" ").filter((w) => w && !STOP.has(w));
function voiceCorrect(transcript, options, correctIdx) {
  if (!transcript) return null; // null = no answer yet
  const heard = new Set(toks(transcript));
  const scores = options.map((opt) => { const t = toks(opt); return t.length ? t.filter((w) => heard.has(w)).length / t.length : 0; });
  const best = Math.max(...scores);
  if (best < 0.25) return null;
  const bestIdx = scores.indexOf(best);
  const second = scores.filter((_, i) => i !== bestIdx).reduce((a, b) => Math.max(a, b), 0);
  if (best - second < 0.1) return null;
  return bestIdx === correctIdx;
}

function AudioQuestion({ q, onAnswer, answered }) {
  const [recState, setRecState] = useState("idle"); // idle | recording | working
  const [transcript, setTranscript] = useState(null);
  const [picked, setPicked] = useState(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    speakInstant(q.q);
    return () => window.speechSynthesis?.cancel();
  }, [q.q]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recRef.current = rec; chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        setRecState("working");
        try {
          const t = await transcribeBlob(blob);
          setTranscript(t);
          const result = voiceCorrect(t, q.options, q.correct);
          if (result !== null) onAnswer(result, t);
        } catch { setRecState("idle"); }
        setRecState("idle");
      };
      rec.start(); setRecState("recording");
    } catch { setRecState("idle"); }
  };
  const stopRec = () => recRef.current?.stop();

  const chooseMCQ = (idx) => {
    if (answered) return;
    setPicked(idx);
    onAnswer(idx === q.correct, q.options[idx]);
  };

  return (
    <div>
      {/* Replay button — instant */}
      <button onClick={() => speakInstant(q.q)}
        style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "none", background: C.audioSoft,
          color: C.audio, fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: "pointer",
          padding: "8px 14px", borderRadius: 10, marginBottom: 18 }}>
        <Volume2 size={14} /> Replay question
      </button>

      {/* Voice answer */}
      {!answered && (
        <div style={{ background: C.audioSoft, borderRadius: 12, padding: 16, marginBottom: 14 }}>
          <button onClick={recState === "recording" ? stopRec : startRec} disabled={recState === "working"}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", cursor: recState === "working" ? "default" : "pointer",
              padding: "10px 16px", borderRadius: 10, fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#fff",
              background: recState === "recording" ? C.bad : C.audio, opacity: recState === "working" ? 0.6 : 1 }}>
            {recState === "working" ? <Loader size={15} className="spin" /> : recState === "recording" ? <Square size={14} fill="#fff" /> : <Mic size={15} />}
            {recState === "working" ? "Transcribing…" : recState === "recording" ? "Stop" : transcript != null ? "Record again" : "Speak your answer"}
          </button>
          {transcript != null && (
            <div style={{ marginTop: 10, fontFamily: FONT, fontSize: 13, color: C.ink }}>
              <span style={{ color: C.faint }}>You said: </span>"{transcript}"
            </div>
          )}
        </div>
      )}

      {/* MCQ fallback */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0 10px" }}>
        <div style={{ flex: 1, height: 1, background: C.line }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint }}>OR SELECT</span>
        <div style={{ flex: 1, height: 1, background: C.line }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, idx) => {
          const isC = answered && idx === q.correct;
          const isW = answered && picked === idx && idx !== q.correct;
          return (
            <button key={idx} onClick={() => chooseMCQ(idx)} disabled={answered}
              style={{ textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", borderRadius: 12, fontFamily: FONT, fontSize: 14, fontWeight: 600,
                cursor: answered ? "default" : "pointer", transition: "all .15s",
                background: isC ? C.visualSoft : isW ? C.badSoft : C.surface,
                color: isC ? C.good : isW ? C.bad : C.ink,
                border: `1.5px solid ${isC ? C.good : isW ? C.bad : C.line}` }}>
              {opt} {isC && <Check size={16} />}{isW && <X size={16} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VisualQuestion({ q, concepts, onAnswer, answered, picked, setPicked }) {
  const chooseMCQ = (idx) => {
    if (answered) return;
    setPicked(idx);
    onAnswer(idx === q.correct, q.options[idx]);
  };
  return (
    <div>
      {concepts?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.visual, fontWeight: 700, marginBottom: 10 }}>KEY CONCEPTS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
            {concepts.map(({ term, definition }) => (
              <div key={term} style={{ background: C.visualSoft, borderRadius: 10, padding: "12px 12px", border: `1px solid ${C.visual}22` }}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, color: C.visual, marginBottom: 4 }}>{term}</div>
                <div style={{ fontFamily: FONT, fontSize: 12, color: C.sub, lineHeight: 1.4 }}>{definition}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, idx) => {
          const isC = answered && idx === q.correct;
          const isW = answered && picked === idx && idx !== q.correct;
          return (
            <button key={idx} onClick={() => chooseMCQ(idx)} disabled={answered}
              style={{ textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "13px 15px", borderRadius: 12, fontFamily: FONT, fontSize: 14, fontWeight: 600,
                cursor: answered ? "default" : "pointer", transition: "all .15s",
                background: isC ? C.visualSoft : isW ? C.badSoft : C.surface,
                color: isC ? C.good : isW ? C.bad : C.ink,
                border: `1.5px solid ${isC ? C.good : isW ? C.bad : C.line}` }}>
              {opt} {isC && <Check size={16} />}{isW && <X size={16} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Quiz({ topic, mode, prefs, onDone, onBack }) {
  const questions = topic.questions;
  const [i, setI] = useState(0);
  const [qMode, setQMode] = useState(mode);
  const [picked, setPicked] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState([]);

  const q = questions[i];
  const m = MODES[qMode];

  const handleAnswer = (isCorrect, userAnswer) => {
    if (answered) return;
    setAnswered(true);
    setCorrect(isCorrect);
    setPicked(userAnswer);
    setAttempts((prev) => [...prev, { q: q.q, correct: isCorrect, mode: qMode }]);
  };

  const chooseMCQ = (idx) => {
    if (answered) return;
    setPicked(idx);
    handleAnswer(idx === q.correct, q.options[idx]);
  };

  const next = () => {
    if (i + 1 < questions.length) {
      const nextMode = prefs ? pickMode(prefs, qMode) : mode;
      setI(i + 1);
      setQMode(nextMode);
      setPicked(null);
      setAnswered(false);
      setCorrect(null);
      setShowHint(false);
    } else {
      const finalAttempts = [...attempts];
      onDone({ score: finalAttempts.filter((a) => a.correct).length, total: questions.length, hintsUsed, attempts: finalAttempts });
    }
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "30px 22px" }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 10 }}>
        <ChevronLeft size={16} /> Back to course
      </Button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Eyebrow>PRACTICE · {i + 1} OF {questions.length}</Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <m.Icon size={13} color={m.color} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: m.color, fontWeight: 700 }}>{m.label.toUpperCase()}</span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.faint }}>Hints: {hintsUsed}</span>
        </div>
      </div>

      <Card style={{ padding: 26, borderTop: `3px solid ${m.color}` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, color: C.ink, marginBottom: 20 }}>{q.q}</div>

        {qMode === "audio" ? (
          <AudioQuestion q={q} onAnswer={handleAnswer} answered={answered} />
        ) : qMode === "visual" ? (
          <VisualQuestion q={q} concepts={topic.content?.concepts} onAnswer={handleAnswer} answered={answered} picked={picked} setPicked={setPicked} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, idx) => {
              const isC = answered && idx === q.correct;
              const isW = answered && picked === idx && idx !== q.correct;
              return (
                <button key={idx} onClick={() => chooseMCQ(idx)} disabled={answered}
                  style={{ textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderRadius: 12, fontFamily: MONO, fontSize: 15, fontWeight: 700,
                    cursor: answered ? "default" : "pointer", transition: "all .15s",
                    background: isC ? C.visualSoft : isW ? C.badSoft : C.surface,
                    color: isC ? C.good : isW ? C.bad : C.ink,
                    border: `1.5px solid ${isC ? C.good : isW ? C.bad : C.line}` }}>
                  {opt} {isC && <Check size={18} />}{isW && <X size={18} />}
                </button>
              );
            })}
          </div>
        )}

        {!answered && qMode !== "audio" && (
          <button onClick={() => { setShowHint(true); if (!showHint) setHintsUsed((h) => h + 1); }}
            style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 7, border: "none",
              background: "transparent", color: C.audio, fontFamily: FONT, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            <Lightbulb size={16} /> {showHint ? "Hint shown" : "Need a hint?"}
          </button>
        )}
        {showHint && (
          <div style={{ marginTop: 12, background: C.audioSoft, borderRadius: 10, padding: "12px 14px",
            fontFamily: FONT, fontSize: 14, color: C.ink, display: "flex", gap: 9 }}>
            <Lightbulb size={16} color={C.audio} style={{ flexShrink: 0, marginTop: 2 }} /> {q.hint}
          </div>
        )}

        {answered && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: correct ? C.good : C.bad }}>
              {correct ? "Nice — that's right." : "Not quite — keep going."}
            </span>
            <Button onClick={next} color={correct ? C.good : C.brand}>
              {i + 1 < questions.length ? "Next question" : "See results"} <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
