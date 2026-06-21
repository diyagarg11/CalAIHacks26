import { useState, useRef } from "react";
import {
  ChevronLeft, Target, RotateCcw, Lightbulb, Activity,
  Brain, Zap, HelpCircle, BookOpen, Upload, Loader, FileText, CheckCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { C, FONT, DISPLAY, MONO, MODES, STATUS } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Avatar } from "../../components/Avatar";
import { Stat } from "./Stat";

const chartTip = {
  contentStyle: { fontFamily: FONT, fontSize: 12, borderRadius: 10, border: `1px solid ${C.line}` },
  labelStyle: { color: C.ink, fontWeight: 600 },
};

const FLAG_LABELS = {
  audio_preferred: "Audio preferred",
  visual_aids: "Visual aids",
  text_preferred: "Text preferred",
  extended_time: "Extended time",
  chunked_instructions: "Chunked instructions",
  verbal_response_ok: "Verbal responses OK",
  reduced_complexity: "Simplified language",
  frequent_breaks: "Frequent breaks",
  repeat_instructions: "Repeat instructions",
  reduced_distractions: "Reduced distractions",
  audio_narration_required: "Audio narration required",
  captions_required: "Captions required",
  no_flashing: "No flashing",
};

const FLAG_COLORS = {
  audio_preferred: C.audio,
  audio_narration_required: C.audio,
  verbal_response_ok: C.audio,
  visual_aids: C.visual,
  no_flashing: C.visual,
  text_preferred: C.brand,
};

function IepPanel({ student, onIepLoad }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [flags, setFlags] = useState([]);
  const [notes, setNotes] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      setErrMsg("Please select a PDF file.");
      return;
    }
    setFileName(file.name);
    setState("loading");
    setErrMsg(null);

    const form = new FormData();
    form.append("file", file);
    if (student?.id) form.append("studentId", String(student.id));

    try {
      const res = await fetch("/api/iep/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      setFlags(data.flags ?? []);
      setNotes(data.notes ?? null);
      setState("done");
      onIepLoad?.(data.flags ?? []);
    } catch (e) {
      setErrMsg(e.message);
      setState("error");
    }
  };

  return (
    <Card style={{ padding: 20, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>IEP Accommodations</div>
          <div style={{ fontFamily: FONT, fontSize: 12.5, color: C.faint, marginTop: 2 }}>
            Upload an IEP PDF — Claude will extract accommodation flags and adjust learning weights.
          </div>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={state === "loading"}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7, border: "none",
            background: C.brandSoft, color: C.brand, fontFamily: FONT, fontWeight: 600,
            fontSize: 13, cursor: state === "loading" ? "default" : "pointer",
            padding: "9px 14px", borderRadius: 10, opacity: state === "loading" ? 0.6 : 1,
          }}>
          {state === "loading" ? <Loader size={14} className="spin" /> : <Upload size={14} />}
          {state === "loading" ? "Parsing…" : "Upload IEP"}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {state === "idle" && (
        <div style={{ border: `1.5px dashed ${C.line}`, borderRadius: 12, padding: "22px 18px",
          textAlign: "center", color: C.faint, fontFamily: FONT, fontSize: 13 }}>
          No IEP on file — upload a PDF to personalize this student's learning path.
        </div>
      )}

      {state === "error" && (
        <div style={{ background: C.badSoft, borderRadius: 10, padding: "12px 14px",
          fontFamily: FONT, fontSize: 13, color: C.bad }}>
          {errMsg}
        </div>
      )}

      {state === "done" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <CheckCircle size={15} color={C.good} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.good, fontWeight: 700 }}>
              PARSED · {fileName}
            </span>
          </div>

          {notes && (
            <div style={{ background: C.brandSoft, borderRadius: 10, padding: "11px 13px",
              fontFamily: FONT, fontSize: 13, color: C.ink, lineHeight: 1.55, marginBottom: 14 }}>
              <FileText size={13} color={C.brand} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              {notes}
            </div>
          )}

          {flags.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {flags.map((f) => {
                const color = FLAG_COLORS[f] ?? C.sub;
                return (
                  <span key={f} style={{
                    fontFamily: MONO, fontSize: 11, fontWeight: 700,
                    color, background: `${color}18`,
                    padding: "5px 10px", borderRadius: 999,
                    border: `1px solid ${color}33`,
                  }}>
                    {FLAG_LABELS[f] ?? f}
                  </span>
                );
              })}
            </div>
          ) : (
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint }}>
              No specific accommodation flags extracted.
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function StudentDetail({ student, onBack, onIepLoad }) {
  const st = STATUS[student.status];
  const modeData = [
    { mode: "Text", v: student.mode === "text" ? 82 : 54 },
    { mode: "Audio", v: student.mode === "audio" ? 80 : 58 },
    { mode: "Visual", v: student.mode === "visual" ? 86 : 61 },
  ];
  const metrics = [
    ["Effective mastery", `${student.mastery}%`, "access-adjusted", C.brand, Target],
    ["Error recovery", `${student.recovery}%`, "right after a miss", C.visual, RotateCcw],
    ["Hint dependency", `${student.hint}%`, "of questions", C.audio, Lightbulb],
    ["Focused time", `${student.focus}h`, "active / week", C.brand, Activity],
  ];
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "30px 22px" }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 14 }}><ChevronLeft size={16} /> Dashboard</Button>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <Avatar name={student.name} size={58} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.ink, margin: 0 }}>{student.name}</h1>
          <div style={{ fontFamily: FONT, fontSize: 14, color: C.faint }}>{student.email}</div>
        </div>
        <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: st.color,
          background: st.soft, padding: "7px 14px", borderRadius: 999 }}>{st.label}</span>
      </div>

      {student.status === "needs-support" && (
        <Card style={{ padding: "14px 18px", marginTop: 18, background: C.badSoft, border: "none",
          display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Brain size={18} color={C.bad} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: FONT, fontSize: 14, color: C.ink, lineHeight: 1.5 }}>
            <b>Stuck-loop detected.</b> High time on task with low accuracy and heavy hint use suggests a concept
            gap in Quadratics rather than effort. Try a 1:1 in <b>{MODES[student.mode].label.toLowerCase()}</b> mode — their strongest channel.
          </span>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginTop: 18 }}>
        {metrics.map(([l, v, s, c, I]) => <Stat key={l} label={l} value={v} sub={s} Icon={I} color={c} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 4 }}>Performance by mode</div>
          <p style={{ fontFamily: FONT, fontSize: 12.5, color: C.faint, margin: "0 0 6px" }}>
            What the recommender learned from real results.
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={modeData} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mode" tick={{ fontFamily: FONT, fontSize: 12, fill: C.sub }} />
              <YAxis domain={[0, 100]} tick={{ fontFamily: MONO, fontSize: 11, fill: C.faint }} />
              <Tooltip {...chartTip} cursor={{ fill: C.paper }} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]} barSize={46}>
                {modeData.map((d, idx) => (
                  <Cell key={idx} fill={[C.text, C.audio, C.visual][idx]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 14 }}>Recommended next</div>
          {[
            [Zap, "Keep leading with " + MODES[student.mode].label + " mode", "+18% accuracy vs. their average"],
            [HelpCircle, "Re-teach: Quadratics", "Weakest topic, blocking progress"],
            [BookOpen, "3 practice problems queued", "Auto-sourced for this gap"],
          ].map(([I, t, s], idx) => (
            <div key={idx} style={{ display: "flex", gap: 12, padding: "11px 0",
              borderTop: idx ? `1px solid ${C.line}` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.brandSoft, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <I size={17} color={C.brand} />
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: C.ink }}>{t}</div>
                <div style={{ fontFamily: FONT, fontSize: 12.5, color: C.faint }}>{s}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <IepPanel student={student} onIepLoad={onIepLoad} />
    </div>
  );
}
