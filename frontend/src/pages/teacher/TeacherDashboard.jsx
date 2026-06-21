import { useState } from "react";
import {
  Upload, Target, CheckCircle2, Clock, Lightbulb, AlertTriangle,
  ChevronRight, ChevronLeft, Sparkles, ArrowRight, X, FileText, Loader,
} from "lucide-react";
import {
  ScatterChart, Scatter, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { C, FONT, DISPLAY, MONO } from "../../constants/tokens";
import { STUDENTS } from "../../constants/data";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Eyebrow } from "../../components/Eyebrow";
import { Avatar } from "../../components/Avatar";
import { Stat } from "./Stat";
import { StudentTable } from "./StudentTable";

const chartTip = {
  contentStyle: { fontFamily: FONT, fontSize: 12, borderRadius: 10, border: `1px solid ${C.line}` },
  labelStyle: { color: C.ink, fontWeight: 600 },
};

const BASE = import.meta.env.VITE_API_URL || "";

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadModal({ onClose }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [uploaded, setUploaded] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [drag, setDrag] = useState(false);

  const addFiles = (incoming) => {
    const pdfs = Array.from(incoming).filter((f) => f.type === "application/pdf");
    if (!pdfs.length) { setErrorMsg("Only PDF files are accepted."); return; }
    setErrorMsg("");
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...pdfs.filter((f) => !names.has(f.name))];
    });
  };

  const remove = (name) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const submit = async () => {
    if (!files.length) { setErrorMsg("Add at least one PDF before uploading."); return; }
    setStatus("uploading");
    const body = new FormData();
    files.forEach((f) => body.append("files", f));
    try {
      const res = await fetch(`${BASE}/api/upload`, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploaded(data.files);
      setStatus("done");
    } catch (e) {
      setErrorMsg(e.message);
      setStatus("error");
    }
  };

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(26,27,46,.45)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: C.surface, borderRadius: 20, padding: 32, width: "100%", maxWidth: 500,
          boxShadow: "0 24px 60px rgba(26,27,46,.18)" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: C.ink }}>Upload materials</div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.faint, display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        {status === "done" ? (
          <div>
            <div style={{ fontFamily: FONT, fontSize: 15, color: C.ink, marginBottom: 14 }}>
              {uploaded.length} file{uploaded.length !== 1 ? "s" : ""} uploaded successfully.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {uploaded.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: C.paper, borderRadius: 10, border: `1px solid ${C.line}` }}>
                  <FileText size={16} color={C.brand} />
                  <span style={{ flex: 1, fontFamily: FONT, fontSize: 14, color: C.ink }}>{f.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint }}>{fmt(f.size)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <Button onClick={onClose}>Done</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById("pdf-input").click()}
              style={{ border: `2px dashed ${drag ? C.brand : C.line}`, borderRadius: 14, padding: "32px 20px",
                textAlign: "center", cursor: "pointer", background: drag ? C.brandSoft : C.paper,
                transition: "all .15s", marginBottom: 16 }}>
              <Upload size={28} color={drag ? C.brand : C.faint} style={{ margin: "0 auto 10px" }} />
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink }}>
                Drop PDFs here or click to browse
              </div>
              <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint, marginTop: 4 }}>
                PDF only · up to 50 MB each · at least 1 required
              </div>
              <input id="pdf-input" type="file" accept="application/pdf" multiple hidden
                onChange={(e) => addFiles(e.target.files)} />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {files.map((f) => (
                  <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    background: C.paper, borderRadius: 10, border: `1px solid ${C.line}` }}>
                    <FileText size={16} color={C.brand} />
                    <span style={{ flex: 1, fontFamily: FONT, fontSize: 14, color: C.ink }}>{f.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint, marginRight: 6 }}>{fmt(f.size)}</span>
                    <button onClick={() => remove(f.name)}
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: C.faint, display: "flex" }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errorMsg && (
              <p style={{ fontFamily: FONT, fontSize: 13, color: C.bad, margin: "0 0 12px" }}>{errorMsg}</p>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="soft" onClick={onClose}>Cancel</Button>
              <Button onClick={submit} disabled={status === "uploading"}
                style={{ opacity: status === "uploading" ? 0.6 : 1 }}>
                {status === "uploading"
                  ? <><Loader size={15} className="spin" /> Uploading…</>
                  : <><Upload size={15} /> Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""}` : "files"}</>}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TeacherDashboard({ course, onBack, onStudent }) {
  const { kpis, topics, chatbot, accuracyOverTime, reteach } = course;
  const flagged = STUDENTS.filter((s) => s.status === "needs-support");
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div style={{ maxWidth: 1140, margin: "0 auto", padding: "30px 22px" }}>
      {/* Back + header */}
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 12 }}>
        <ChevronLeft size={16} /> My courses
      </Button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: (course.color || C.brand) + "18",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          }}>
            {course.emoji || "📚"}
          </div>
          <div>
            <Eyebrow>{course.title.toUpperCase()} · {course.period ? course.period.toUpperCase() : "NEW COURSE"} · {course.students || 0} STUDENTS</Eyebrow>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: "4px 0 0" }}>Class dashboard</h1>
          </div>
        </div>
        <Button variant="soft" onClick={() => setShowUpload(true)}><Upload size={16} /> Upload materials</Button>
      </div>

      {/* No data state */}
      {!kpis ? (
        <Card style={{ padding: 48, marginTop: 28, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>{course.emoji || "📚"}</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: C.ink, marginBottom: 8 }}>
            No data yet for {course.title}
          </div>
          <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, maxWidth: 360, margin: "0 auto 22px" }}>
            Upload course materials and invite students to start seeing metrics here.
          </p>
          <Button onClick={() => setShowUpload(true)}><Upload size={15} /> Upload materials</Button>
        </Card>
      ) : (
        <>
          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 22 }}>
            <Stat label="Class mastery"     value={`${kpis.mastery}%`}  Icon={Target}       color={C.brand}  trend={kpis.masteryTrend} />
            <Stat label="Avg. accuracy"     value={`${kpis.accuracy}%`} Icon={CheckCircle2} color={C.visual} trend={kpis.accuracyTrend} />
            <Stat label="Focused time / wk" value={`${kpis.focus}h`}    sub="active, not idle" Icon={Clock}  color={C.audio}  trend={kpis.focusTrend} />
            <Stat label="Hint dependency"   value={`${kpis.hint}%`}     Icon={Lightbulb}    color={C.bad}    trend={kpis.hintTrend} />
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 16 }}>
            <Card style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>Chatbot interaction time</div>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint }}>MINS / WEEK</span>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <ScatterChart margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
                  <CartesianGrid stroke={C.line} strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="week" name="Week" tick={{ fontFamily: MONO, fontSize: 11, fill: C.faint }} />
                  <YAxis type="number" dataKey="mins" name="Mins" tick={{ fontFamily: MONO, fontSize: 11, fill: C.faint }} />
                  <Tooltip {...chartTip} cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={chatbot} fill={course.color}>
                    {chatbot.map((_, idx) => <Cell key={idx} fill={course.color} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 8 }}>Accuracy over time</div>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={accuracyOverTime} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
                  <CartesianGrid stroke={C.line} strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontFamily: MONO, fontSize: 11, fill: C.faint }} />
                  <YAxis domain={[40, 90]} tick={{ fontFamily: MONO, fontSize: 11, fill: C.faint }} />
                  <Tooltip {...chartTip} />
                  <Line type="monotone" dataKey="acc" stroke={course.color} strokeWidth={3} dot={{ r: 3, fill: course.color }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <Card style={{ padding: 20 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 8 }}>Mastery by topic</div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={topics} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 8 }}>
                  <CartesianGrid stroke={C.line} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontFamily: MONO, fontSize: 11, fill: C.faint }} />
                  <YAxis type="category" dataKey="topic" width={78} tick={{ fontFamily: FONT, fontSize: 12, fill: C.sub }} />
                  <Tooltip {...chartTip} cursor={{ fill: C.paper }} />
                  <Bar dataKey="mastery" radius={[0, 6, 6, 0]} barSize={16}>
                    {topics.map((t, idx) => (
                      <Cell key={idx} fill={t.mastery < 50 ? C.bad : t.mastery < 70 ? C.audio : C.visual} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card style={{ padding: 20, background: C.ink, border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Sparkles size={18} color={C.audio} />
                <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: "#fff" }}>Suggested 10-min reteach</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "#A8A9C8", letterSpacing: 1, marginBottom: 8 }}>TOP WEAK CONCEPTS</div>
              {reteach.map(([t, m, why], idx) => (
                <div key={t} style={{ display: "flex", gap: 12, padding: "11px 0",
                  borderTop: idx ? "1px solid rgba(255,255,255,.08)" : "none" }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: C.audio, width: 34 }}>{m}</span>
                  <div>
                    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#fff" }}>{t}</div>
                    <div style={{ fontFamily: FONT, fontSize: 12.5, color: "#B9BAD4", lineHeight: 1.4 }}>{why}</div>
                  </div>
                </div>
              ))}
              <Button color={C.audio} style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>
                Generate reteach slides <ArrowRight size={15} />
              </Button>
            </Card>
          </div>

          {/* Who needs help */}
          <Card style={{ padding: 20, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <AlertTriangle size={18} color={C.bad} />
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>Who needs help right now</span>
            </div>
            <p style={{ fontFamily: FONT, fontSize: 13, color: C.faint, margin: "0 0 14px" }}>
              Flagged on low mastery + low improvement, or high hint use + low recovery.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {flagged.map((s) => (
                <div key={s.id} onClick={() => onStudent(s)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12,
                    background: C.badSoft, cursor: "pointer" }}>
                  <Avatar name={s.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink }}>{s.name}</div>
                    <div style={{ fontFamily: FONT, fontSize: 12.5, color: C.sub }}>
                      Mastery {s.mastery}% · hint use {s.hint}% · recovery {s.recovery}%
                    </div>
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.bad,
                    display: "flex", alignItems: "center", gap: 4 }}>View <ChevronRight size={15} /></span>
                </div>
              ))}
            </div>
          </Card>

          <StudentTable onStudent={onStudent} />
        </>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}
