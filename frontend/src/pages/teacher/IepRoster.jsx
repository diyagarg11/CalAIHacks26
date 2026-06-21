import { useState, useRef } from "react";
import { Upload, Loader, CheckCircle, AlertCircle, Users, Brain, FileText } from "lucide-react";
import { C, FONT, DISPLAY, MONO } from "../../constants/tokens";
import { STUDENTS } from "../../constants/data";
import { Card } from "../../components/Card";
import { Avatar } from "../../components/Avatar";
import { ModeBadge } from "../../components/ModeBadge";

const FLAG_LABELS = {
  audio_preferred:          "Audio preferred",
  visual_aids:              "Visual aids",
  text_preferred:           "Text preferred",
  extended_time:            "Extended time",
  chunked_instructions:     "Chunked instructions",
  verbal_response_ok:       "Verbal responses OK",
  reduced_complexity:       "Simplified language",
  frequent_breaks:          "Frequent breaks",
  repeat_instructions:      "Repeat instructions",
  reduced_distractions:     "Reduced distractions",
  audio_narration_required: "Audio narration required",
  captions_required:        "Captions required",
  no_flashing:              "No flashing",
};

const FLAG_COLOR = (f) => {
  if (["audio_preferred", "audio_narration_required", "verbal_response_ok"].includes(f)) return C.audio;
  if (["visual_aids", "no_flashing"].includes(f)) return C.visual;
  if (["text_preferred"].includes(f)) return C.brand;
  return C.sub;
};

function StudentIepCard({ student, onStudent, onIepLoad }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [flags, setFlags] = useState([]);
  const [notes, setNotes] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      setErrMsg("PDF files only.");
      return;
    }
    setState("loading");
    setErrMsg(null);
    const form = new FormData();
    form.append("file", file);
    form.append("studentId", String(student.id));
    try {
      const res = await fetch("/api/iep/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      setFlags(data.flags ?? []);
      setNotes(data.notes ?? null);
      setState("done");
      onIepLoad?.(student.id, data.flags ?? []);
    } catch (e) {
      setErrMsg(e.message);
      setState("error");
    }
  };

  const statusColor = student.status === "thriving" ? C.good : student.status === "needs-support" ? C.bad : C.audio;

  return (
    <Card style={{ padding: 20 }}>
      {/* Student header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <Avatar name={student.name} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <button onClick={() => onStudent(student)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0,
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink,
              textDecoration: "underline", textDecorationColor: "transparent",
              transition: "text-decoration-color .15s" }}
            onMouseEnter={(e) => e.currentTarget.style.textDecorationColor = C.brand}
            onMouseLeave={(e) => e.currentTarget.style.textDecorationColor = "transparent"}>
            {student.name}
          </button>
          <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint, marginTop: 1 }}>{student.email}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <ModeBadge mode={student.mode} size={11} />
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: statusColor,
            background: `${statusColor}18`, padding: "3px 9px", borderRadius: 999 }}>
            {student.status.replace("-", " ").toUpperCase()}
          </span>
        </div>
      </div>

      {/* IEP section */}
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
        {state === "idle" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: FONT, fontSize: 13, color: C.faint }}>No IEP on file</span>
            <button onClick={() => inputRef.current?.click()}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1.5px solid ${C.line}`,
                background: "transparent", color: C.brand, fontFamily: FONT, fontWeight: 600,
                fontSize: 13, cursor: "pointer", padding: "7px 13px", borderRadius: 9,
                transition: "background .15s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.brandSoft}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <Upload size={13} /> Upload IEP
            </button>
          </div>
        )}

        {state === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.sub, fontFamily: FONT, fontSize: 13 }}>
            <Loader size={14} className="spin" color={C.brand} /> Claude is reading the IEP…
          </div>
        )}

        {state === "error" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT, fontSize: 13, color: C.bad }}>
              <AlertCircle size={14} /> {errMsg || "Parse failed"}
            </div>
            <button onClick={() => { setState("idle"); setErrMsg(null); }}
              style={{ fontFamily: FONT, fontSize: 12, color: C.brand, background: "none", border: "none", cursor: "pointer" }}>
              Try again
            </button>
          </div>
        )}

        {state === "done" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} color={C.good} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.good, fontWeight: 700 }}>IEP LOADED</span>
              </div>
              <button onClick={() => { setState("idle"); setFlags([]); setNotes(null); inputRef.current?.click(); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: "none",
                  color: C.faint, fontFamily: FONT, fontSize: 12, cursor: "pointer" }}>
                <Upload size={11} /> Replace
              </button>
            </div>
            {notes && (
              <div style={{ background: C.brandSoft, borderRadius: 9, padding: "9px 12px",
                fontFamily: FONT, fontSize: 12.5, color: C.ink, lineHeight: 1.5, marginBottom: 10 }}>
                <FileText size={12} color={C.brand} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
                {notes}
              </div>
            )}
            {flags.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {flags.map((f) => {
                  const col = FLAG_COLOR(f);
                  return (
                    <span key={f} style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700,
                      color: col, background: `${col}18`, padding: "4px 9px", borderRadius: 999,
                      border: `1px solid ${col}33` }}>
                      {FLAG_LABELS[f] ?? f}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span style={{ fontFamily: FONT, fontSize: 12.5, color: C.faint }}>No specific flags extracted.</span>
            )}
          </div>
        )}

        <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
    </Card>
  );
}

export function IepRoster({ onStudent, onIepLoad }) {
  const [loadedCount, setLoadedCount] = useState(0);

  const handleIep = (studentId, flags) => {
    setLoadedCount((n) => n + 1);
    onIepLoad?.(studentId, flags);
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "30px 22px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: C.brandSoft,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={20} color={C.brand} />
            </div>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.ink, margin: 0 }}>
              Students &amp; IEPs
            </h1>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, margin: 0 }}>
            Upload each student's IEP — Claude extracts accommodation flags that automatically adjust
            their modality weights and learning delivery.
          </p>
        </div>
        <Card style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <Users size={18} color={C.brand} />
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: C.ink }}>
              {loadedCount}/{STUDENTS.length}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint }}>IEPs on file</div>
          </div>
        </Card>
      </div>

      {/* How it works banner */}
      <div style={{ background: C.brandSoft, borderRadius: 14, padding: "14px 18px", marginBottom: 22,
        display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Brain size={18} color={C.brand} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontFamily: FONT, fontSize: 13, color: C.ink, lineHeight: 1.55 }}>
          <b>How it works:</b> Upload a PDF IEP for any student. Claude reads it and extracts structured
          accommodation flags (e.g. "audio preferred", "extended time"). These flags automatically boost
          the corresponding modality weights in that student's adaptive learning profile — no manual configuration needed.
        </div>
      </div>

      {/* Student grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 14 }}>
        {STUDENTS.map((s) => (
          <StudentIepCard key={s.id} student={s} onStudent={onStudent} onIepLoad={handleIep} />
        ))}
      </div>
    </div>
  );
}
