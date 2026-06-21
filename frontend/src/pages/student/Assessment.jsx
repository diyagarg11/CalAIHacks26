import { useState, useEffect, useRef } from "react";
import { ArrowRight, Play, Pause, Volume2, BookOpen, ShieldCheck, Gauge, Mic, Square, Loader } from "lucide-react";
import { C, FONT, DISPLAY, MONO, MODES } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ModeBadge } from "../../components/ModeBadge";
import { Eyebrow } from "../../components/Eyebrow";
import { ACCOMMODATION_RULES } from "../../constants/diagnostic";
import { getDiagnostic, submitDiagnostic } from "../../lib/api";
import { fetchTtsUrl, transcribeBlob } from "../../lib/speech";

const WRAP = { maxWidth: 640, margin: "0 auto", padding: "44px 22px" };

// ── Audio presentation: narrate the script with Deepgram TTS (Aura) streamed
// from our backend. Falls back to the browser's speech synthesis if the backend
// or Deepgram is unavailable, so the lesson always plays.
function AudioPanel({ script }) {
  const [playing, setPlaying] = useState(false);
  const [src, setSrc] = useState(null);     // Deepgram audio URL, once fetched
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let alive = true;
    let url = null;
    fetchTtsUrl(script).then((u) => {
      if (!alive) return;
      if (u) { url = u; setSrc(u); } else { setUseFallback(true); }
      setLoading(false);
    });
    return () => {
      alive = false;
      window.speechSynthesis?.cancel();
      if (url) URL.revokeObjectURL(url);
    };
  }, [script]);

  const toggle = () => {
    if (useFallback) {
      const synth = window.speechSynthesis;
      if (!synth) return;
      if (playing) { synth.cancel(); setPlaying(false); return; }
      const u = new SpeechSynthesisUtterance(script);
      u.onend = () => setPlaying(false);
      synth.cancel(); synth.speak(u); setPlaying(true);
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play();
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
              <div key={i} style={{ flex: 1, height: h, background: C.audio, opacity: playing ? 1 : 0.32, borderRadius: 2,
                transition: "opacity .2s" }} />
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
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      )}
      <p style={{ fontFamily: FONT, fontSize: 13, color: C.faint, lineHeight: 1.6, marginTop: 14 }}>
        Audio mode — listen to the narration. (Transcript hidden so this measures listening comprehension.)
      </p>
    </div>
  );
}

// ── Voice answer: records the student's spoken answer and returns the raw
// transcript. No MCQ matching — the backend grades the text against the correct
// answer via keyword overlap.
function VoiceAnswer({ captured, onCapture }) {
  const [state, setState] = useState("idle"); // idle | recording | working | denied | error
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        setState("working");
        try {
          const transcript = await transcribeBlob(blob);
          onCapture(transcript);
          setState("idle");
        } catch { setState("error"); }
      };
      rec.start();
      setState("recording");
    } catch { setState("denied"); }
  };
  const stop = () => recRef.current?.stop();

  const recording = state === "recording";
  const busy = state === "working";

  return (
    <div style={{ background: C.audioSoft, borderRadius: 12, padding: 18, marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: captured ? 12 : 0 }}>
        <button onClick={recording ? stop : start} disabled={busy}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", cursor: busy ? "default" : "pointer",
            padding: "11px 18px", borderRadius: 10, fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#fff",
            background: recording ? C.bad : C.audio, opacity: busy ? 0.6 : 1 }}>
          {busy ? <Loader size={16} className="spin" /> : recording ? <Square size={15} fill="#fff" /> : <Mic size={16} />}
          {busy ? "Transcribing…" : recording ? "Stop recording" : captured != null ? "Record again" : "Speak your answer"}
        </button>
        <span style={{ fontFamily: FONT, fontSize: 13, color: C.sub }}>
          {recording ? "Listening…" : busy ? "Processing…" : "Answer out loud in your own words."}
        </span>
      </div>
      {captured != null && (
        <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", fontFamily: FONT, fontSize: 14, color: C.ink }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint, display: "block", marginBottom: 4 }}>YOUR ANSWER</span>
          {captured || <span style={{ color: C.faint, fontStyle: "italic" }}>— nothing heard, try again —</span>}
        </div>
      )}
      {state === "denied" && (
        <p style={{ margin: "8px 0 0", fontFamily: FONT, fontSize: 13, color: C.bad }}>
          Microphone access was blocked. Check your browser permissions and try again.
        </p>
      )}
      {state === "error" && (
        <p style={{ margin: "8px 0 0", fontFamily: FONT, fontSize: 13, color: C.bad }}>
          Transcription failed — please try again.
        </p>
      )}
    </div>
  );
}

function TextPanel({ body }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: 16, color: C.ink, lineHeight: 1.7 }}>
      {body.map((p, i) => <p key={i} style={{ marginTop: i === 0 ? 0 : 14 }}>{p}</p>)}
    </div>
  );
}

export function Assessment({ studentId = 1, accommodationFlags = [], onDone }) {
  const [phase, setPhase] = useState("loading");
  const [flow, setFlow] = useState(null);          // { skip, order, lesson, accommodation, online }
  const [step, setStep] = useState(0);             // index into flow.order
  const [answers, setAnswers] = useState({ text: [], audio: [] });
  const [seconds, setSeconds] = useState({});
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const startRef = useRef(0);

  useEffect(() => {
    getDiagnostic(studentId, accommodationFlags).then((f) => {
      setFlow(f);
      setPhase(f.skip ? "accommodation" : "intro");
    });
  }, [studentId]);

  const currentFormat = flow?.order?.[step];

  const beginPresent = () => { startRef.current = Date.now(); setQi(0); setPicked(null); setPhase("present"); };

  const startQuiz = () => { setPhase("quiz"); setQi(0); setPicked(null); };

  const choose = (idx) => {
    setPicked(idx);
    setAnswers((a) => {
      const next = { ...a, [currentFormat]: [...(a[currentFormat] || [])] };
      next[currentFormat][qi] = idx;
      return next;
    });
  };

  const captureAudio = (transcript) => {
    setPicked(transcript);
    setAnswers((a) => {
      const next = { ...a, audio: [...(a.audio || [])] };
      next.audio[qi] = transcript;
      return next;
    });
  };

  const nextQuestion = async () => {
    const total = flow.lesson.formats[currentFormat].quiz.length;
    if (qi + 1 < total) { setQi(qi + 1); setPicked(null); return; }
    // Finished this format's quiz — record time.
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    const nextSeconds = { ...seconds, [currentFormat]: elapsed };
    setSeconds(nextSeconds);

    if (step + 1 < flow.order.length) { setStep(step + 1); setPhase("transition"); return; }
    // Both formats done — submit.
    setPhase("submitting");
    const results = {};
    for (const f of flow.order) results[f] = { answers: answers[f] || [], seconds: nextSeconds[f] };
    const out = await submitDiagnostic(studentId, results, accommodationFlags);
    setResult(out.assessment);
    setPhase("result");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (phase === "loading" || !flow)
    return <div style={WRAP}><p style={{ fontFamily: FONT, color: C.sub }}>Preparing your assessment…</p></div>;

  if (phase === "accommodation") {
    const fmt = flow.mandatedFormat;
    const flag = (flow.accommodation?.applied || []).find((f) => ACCOMMODATION_RULES[f]?.mandate);
    return (
      <div style={WRAP}>
        <Eyebrow>STEP 1 · LEARNING PROFILE</Eyebrow>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: "8px 0 14px" }}>
          Your format is set by your accommodation
        </h1>
        <Card style={{ padding: 22, display: "flex", gap: 14, alignItems: "flex-start", background: C.brandSoft, border: "none" }}>
          <ShieldCheck size={22} color={C.brand} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontFamily: FONT, fontSize: 15, color: C.ink, margin: 0, lineHeight: 1.6 }}>
              Your teacher has set <b>"{ACCOMMODATION_RULES[flag]?.label || "an accommodation"}"</b>, so we're assigning{" "}
              <ModeBadge mode={fmt} /> directly. We skip the diagnostic here — an accommodation always takes priority,
              and the adaptive engine can never override it.
            </p>
          </div>
        </Card>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
          <Button onClick={() => onDone({ assignedFormat: fmt, scores: result?.scores })}>
            Start learning <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div style={WRAP}>
        <Eyebrow>STEP 1 · LEARNING PROFILE</Eyebrow>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.ink, margin: "8px 0 8px" }}>
          Let's measure how you learn best
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 15, color: C.sub, margin: "0 0 24px", lineHeight: 1.6 }}>
          We won't ask which format you <i>prefer</i>. Instead you'll learn one short, unrelated topic{" "}
          <b>two ways</b> — and a quick quiz after each measures what actually stuck. Whichever scores higher
          becomes your starting format.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            [Gauge, "Measured, not self-reported", "Your comprehension does the talking."],
            [BookOpen, "One neutral topic, two formats", `~${flow.lesson.estimatedSeconds}s each, shown in a random order.`],
          ].map(([I, t, s]) => (
            <Card key={t} style={{ padding: 16, display: "flex", gap: 13, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.brandSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <I size={19} color={C.brand} />
              </div>
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.ink }}>{t}</div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint }}>{s}</div>
              </div>
            </Card>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
          <Button onClick={beginPresent}>Begin <ArrowRight size={16} /></Button>
        </div>
      </div>
    );
  }

  if (phase === "transition") {
    const m = MODES[currentFormat];
    return (
      <div style={WRAP}>
        <Eyebrow>NEXT FORMAT</Eyebrow>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.ink, margin: "8px 0 10px" }}>
          Same topic — now in {m.label.toLowerCase()}
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 15, color: C.sub, margin: "0 0 24px", lineHeight: 1.6 }}>
          You'll see the same facts presented as <ModeBadge mode={currentFormat} />, then a fresh quiz. We don't show
          your last score yet — that keeps this round a fair test.
        </p>
        <Button onClick={beginPresent}>Continue <ArrowRight size={16} /></Button>
      </div>
    );
  }

  if (phase === "present") {
    const m = MODES[currentFormat];
    const fmt = flow.lesson.formats[currentFormat];
    return (
      <div style={WRAP}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Eyebrow>FORMAT {step + 1} OF {flow.order.length}</Eyebrow>
          <ModeBadge mode={currentFormat} />
        </div>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.ink, margin: "0 0 16px" }}>{fmt.title}</h1>
        <Card style={{ padding: 24, minHeight: 180, borderTop: `3px solid ${m.color}` }}>
          {currentFormat === "audio" ? <AudioPanel script={fmt.script} /> : <TextPanel body={fmt.body} />}
        </Card>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
          <Button onClick={startQuiz} color={m.color}>I'm ready — quiz me <ArrowRight size={16} /></Button>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = flow.lesson.formats[currentFormat].quiz[qi];
    const m = MODES[currentFormat];
    const answered = picked !== null;
    const last = qi + 1 === flow.lesson.formats[currentFormat].quiz.length;
    const isAudio = currentFormat === "audio";
    return (
      <div style={WRAP}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <Eyebrow color={m.color}>{m.label.toUpperCase()} CHECK · {qi + 1} OF {flow.lesson.formats[currentFormat].quiz.length}</Eyebrow>
        </div>
        <Card style={{ padding: 26 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: C.ink, marginBottom: 18 }}>{q.q}</div>
          {isAudio ? (
            // Audio quiz: voice-only, no options shown
            <VoiceAnswer key={qi} captured={typeof picked === "string" ? picked : null} onCapture={captureAudio} />
          ) : (
            // Text quiz: standard MCQ
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((opt, idx) => {
                const on = picked === idx;
                return (
                  <button key={idx} onClick={() => choose(idx)}
                    style={{ textAlign: "left", padding: "14px 16px", borderRadius: 12, fontFamily: FONT, fontSize: 15,
                      fontWeight: 600, cursor: "pointer", transition: "all .12s",
                      background: on ? m.color : C.surface, color: on ? "#fff" : C.ink,
                      border: `1.5px solid ${on ? m.color : C.line}` }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <span style={{ fontFamily: FONT, fontSize: 13, color: C.faint }}>
              {isAudio ? "Speak your answer, then press Next." : "No feedback yet — we score both formats at the end."}
            </span>
            <Button onClick={nextQuestion} disabled={!answered} color={m.color}
              style={{ opacity: answered ? 1 : 0.45 }}>
              {last ? (step + 1 < flow.order.length ? "Next format" : "See result") : "Next"} <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "submitting")
    return <div style={WRAP}><p style={{ fontFamily: FONT, color: C.sub }}>Scoring both formats…</p></div>;

  // result
  const a = result;
  const assigned = a.assigned_format;
  return (
    <div style={WRAP}>
      <Eyebrow>ASSESSMENT COMPLETE</Eyebrow>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: "8px 0 6px" }}>
        Your starting format is <span style={{ color: MODES[assigned].color }}>{MODES[assigned].label}</span>
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: C.sub, margin: "0 0 22px", lineHeight: 1.6 }}>
        {a.decided_by === "accommodation"
          ? "Assigned directly from your accommodation."
          : "You scored highest here. The adaptive engine starts you in this format and keeps learning as you go."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {["text", "audio", "visual"].map((f) => {
          const s = a.scores?.[f];
          const bd = a.breakdown?.[f];
          const isAssigned = f === assigned;
          const Mode = MODES[f];
          const Icon = Mode.Icon;
          return (
            <Card key={f} style={{ padding: 20, border: isAssigned ? `2px solid ${Mode.color}` : `1px solid ${C.line}` }}>
              {/* header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: bd ? 16 : 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: Mode.soft,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color={Mode.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.ink }}>{Mode.label}</div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint }}>
                    {s == null
                      ? f === "visual" ? "Untested — sampled in your first lessons" : "Not tested"
                      : `${s.correct} of ${s.total} correct · ${s.seconds}s`}
                  </div>
                </div>
                {s != null && (
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: Mode.color }}>{s.pct}%</div>
                )}
                {isAssigned && <ModeBadge mode={f} size={12} />}
              </div>

              {/* per-question breakdown */}
              {bd && (
                <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                  {bd.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                        background: item.wasCorrect ? "#dcfce7" : "#fee2e2",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.wasCorrect ? "#16a34a" : "#dc2626" }}>
                          {item.wasCorrect ? "✓" : "✗"}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
                          Q{i + 1}: {item.q}
                        </div>
                        <div style={{ fontFamily: FONT, fontSize: 12, color: item.wasCorrect ? "#16a34a" : C.sub, lineHeight: 1.5 }}>
                          {f === "audio"
                            ? <><span style={{ color: C.faint }}>You said: </span>&ldquo;{item.userAnswer || "nothing recorded"}&rdquo;</>
                            : <><span style={{ color: C.faint }}>You chose: </span>&ldquo;{item.userAnswer || "no answer"}&rdquo;</>}
                        </div>
                        {!item.wasCorrect && (
                          <div style={{ fontFamily: FONT, fontSize: 12, color: C.ink, marginTop: 3 }}>
                            <span style={{ color: C.faint }}>Correct answer: </span>
                            <span style={{ fontWeight: 600, color: Mode.color }}>{item.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {flow.online === false && (
        <p style={{ fontFamily: MONO, fontSize: 11, color: C.faint, marginTop: 14 }}>
          offline mode — scored locally; start the backend to persist this baseline
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <Button onClick={() => onDone({ assignedFormat: assigned, scores: a.scores })}>
          Start learning <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
