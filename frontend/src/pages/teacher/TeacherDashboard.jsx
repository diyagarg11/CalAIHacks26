import { useState, useEffect, useRef } from "react";
import {
  Upload, Target, CheckCircle2, Clock, Lightbulb, AlertTriangle,
  ChevronRight, ChevronLeft, Sparkles, ArrowRight, X, FileText, Loader,
  BookOpen, HelpCircle, Zap, MessageSquare, ExternalLink,
  Volume2, VolumeX, ChevronDown, ChevronUp,
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
import { useAuth } from "../../auth/AuthProvider";

const chartTip = {
  contentStyle: { fontFamily: FONT, fontSize: 12, borderRadius: 10, border: `1px solid ${C.line}` },
  labelStyle: { color: C.ink, fontWeight: 600 },
};

const BASE = import.meta.env.VITE_API_URL || "";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const MODULE_META = {
  reading:    { icon: BookOpen,      color: C.brand,  label: "Reading" },
  quiz:       { icon: HelpCircle,    color: C.audio,  label: "Quiz" },
  practice:   { icon: Zap,           color: C.visual, label: "Practice" },
  discussion: { icon: MessageSquare, color: "#6366f1", label: "Discussion" },
};

// ── Upload modal ──────────────────────────────────────────────────────────────

function UploadModal({ onClose, courseId, userId, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
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
    if (courseId) body.append("courseId", courseId);
    if (userId) body.append("uploadedBy", userId);
    try {
      const res = await fetch(`${BASE}/api/upload`, { method: "POST", body });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`);
      }
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      setUploaded(data.files);
      setStatus("done");
      onUploaded?.();
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
              {uploaded.length} file{uploaded.length !== 1 ? "s" : ""} uploaded and embedded successfully.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {uploaded.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: C.paper, borderRadius: 10, border: `1px solid ${C.line}` }}>
                  <FileText size={16} color={C.brand} />
                  <span style={{ flex: 1, fontFamily: FONT, fontSize: 14, color: C.ink }}>{f.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint, marginRight: 6 }}>{fmt(f.size)}</span>
                  {f.chunksEmbedded > 0
                    ? <CheckCircle2 size={14} color={C.visual} title={`${f.chunksEmbedded} chunks embedded`} />
                    : <AlertTriangle size={14} color={C.audio} title="Stored but not embedded" />}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <Button onClick={onClose}>Done</Button>
            </div>
          </div>
        ) : (
          <>
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

// ── Module detail modal ───────────────────────────────────────────────────────

function ModuleDetailModal({ mod, doc, onClose }) {
  const meta = MODULE_META[mod.type] ?? MODULE_META.reading;
  const Icon = meta.icon;

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Questions state
  const [modality, setModality] = useState("text"); // "text" | "audio"
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState({});   // { [qId]: optionText }
  const [revealed, setRevealed] = useState(new Set());
  const [speaking, setSpeaking] = useState(false);

  // Key-points collapse
  const [collapsedKP, setCollapsedKP] = useState(new Set());

  const utteranceRef = useRef(null);

  useEffect(() => {
    fetch("/api/documents/module-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: doc.id,
        documentTitle: doc.title,
        moduleTitle: mod.title,
        moduleDescription: mod.description,
        moduleType: mod.type,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setContent(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utteranceRef.current = u;
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const questions = content?.questions ?? [];
  const q = questions[currentQ];

  const reveal = () => {
    if (!q) return;
    setRevealed((prev) => new Set([...prev, q.id]));
    if (modality === "audio" && q.explanation) speak(q.explanation);
  };

  const goNext = () => { stopSpeaking(); setCurrentQ((i) => Math.min(i + 1, questions.length - 1)); };
  const goPrev = () => { stopSpeaking(); setCurrentQ((i) => Math.max(i - 1, 0)); };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(26,27,46,.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: 22, width: "100%", maxWidth: 900,
          maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 32px 80px rgba(26,27,46,.28)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14, padding: "20px 28px",
          borderBottom: `1px solid ${C.line}`, flexShrink: 0,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: meta.color + "18",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon size={18} color={meta.color} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, color: C.ink,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {mod.title}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint, marginTop: 2 }}>
              {meta.label} · {mod.estimatedMinutes} min · from {doc.title}
            </div>
          </div>
          <button onClick={onClose}
            style={{ border: "none", background: "transparent", cursor: "pointer",
              color: C.faint, display: "flex", padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 48,
            color: C.faint, fontFamily: FONT, fontSize: 14 }}>
            <Loader size={18} className="spin" /> Generating lecture content and questions…
          </div>
        ) : error ? (
          <div style={{ padding: 40, fontFamily: FONT, fontSize: 14, color: C.bad }}>{error}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", flex: 1,
            overflow: "hidden", minHeight: 0 }}>

            {/* ── Lecture column ── */}
            <div style={{ overflowY: "auto", padding: "24px 28px",
              borderRight: `1px solid ${C.line}` }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.brand,
                letterSpacing: 1, marginBottom: 14 }}>LECTURE</div>

              <p style={{ fontFamily: FONT, fontSize: 14, color: C.ink, lineHeight: 1.65,
                margin: "0 0 22px" }}>
                {content.lecture.intro}
              </p>

              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.sub,
                letterSpacing: 1, marginBottom: 12 }}>KEY CONCEPTS</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                {(content.lecture.keyPoints ?? []).map((kp, i) => {
                  const collapsed = collapsedKP.has(i);
                  return (
                    <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 12,
                      overflow: "hidden" }}>
                      <button
                        onClick={() => setCollapsedKP((prev) => {
                          const next = new Set(prev);
                          next.has(i) ? next.delete(i) : next.add(i);
                          return next;
                        })}
                        style={{ width: "100%", display: "flex", alignItems: "center",
                          justifyContent: "space-between", padding: "12px 14px",
                          border: "none", background: C.paper, cursor: "pointer",
                          fontFamily: FONT, fontWeight: 600, fontSize: 14, color: C.ink,
                          textAlign: "left" }}
                      >
                        {kp.title}
                        {collapsed ? <ChevronDown size={14} color={C.faint} />
                          : <ChevronUp size={14} color={C.faint} />}
                      </button>
                      {!collapsed && (
                        <div style={{ padding: "0 14px 14px",
                          fontFamily: FONT, fontSize: 13.5, color: C.sub,
                          lineHeight: 1.65, background: C.surface }}>
                          {kp.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.sub,
                letterSpacing: 1, marginBottom: 10 }}>SUMMARY</div>
              <p style={{ fontFamily: FONT, fontSize: 13.5, color: C.sub, lineHeight: 1.65,
                margin: 0, padding: "12px 14px", background: C.paper,
                borderRadius: 10, border: `1px solid ${C.line}` }}>
                {content.lecture.summary}
              </p>
            </div>

            {/* ── Questions column ── */}
            <div style={{ overflowY: "auto", padding: "24px 28px",
              display: "flex", flexDirection: "column" }}>
              {/* Modality toggle */}
              <div style={{ display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700,
                  color: C.brand, letterSpacing: 1 }}>
                  QUESTIONS · {currentQ + 1} / {questions.length}
                </div>
                <div style={{ display: "flex", borderRadius: 8, overflow: "hidden",
                  border: `1px solid ${C.line}` }}>
                  {["text", "audio"].map((m) => (
                    <button key={m} onClick={() => { stopSpeaking(); setModality(m); }}
                      style={{
                        padding: "5px 14px", border: "none", cursor: "pointer",
                        fontFamily: FONT, fontSize: 12, fontWeight: 500,
                        background: modality === m ? C.brand : C.paper,
                        color: modality === m ? "#fff" : C.faint,
                        transition: "background .15s",
                      }}>
                      {m === "audio" ? "🔊 Audio" : "📝 Text"}
                    </button>
                  ))}
                </div>
              </div>

              {q && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Question text / audio play */}
                  <div style={{ padding: "16px 18px", background: C.paper,
                    borderRadius: 12, border: `1px solid ${C.line}` }}>
                    {modality === "audio" && (
                      <button
                        onClick={() => speaking ? stopSpeaking() : speak(q.question)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          border: "none", background: speaking ? C.bad + "18" : C.brand + "18",
                          color: speaking ? C.bad : C.brand,
                          borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                          fontFamily: FONT, fontSize: 13, fontWeight: 600, marginBottom: 12,
                        }}>
                        {speaking
                          ? <><VolumeX size={14} /> Stop</>
                          : <><Volume2 size={14} /> Listen to question</>}
                      </button>
                    )}
                    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15,
                      color: C.ink, lineHeight: 1.55 }}>
                      {q.question}
                    </div>
                  </div>

                  {/* Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(q.options ?? []).map((opt, oi) => {
                      const isSelected = selected[q.id] === opt;
                      const isRevealed = revealed.has(q.id);
                      const isCorrect = opt === q.answer;
                      let bg = C.paper, border = C.line, color = C.ink;
                      if (isRevealed) {
                        if (isCorrect) { bg = C.visual + "18"; border = C.visual; color = C.ink; }
                        else if (isSelected) { bg = C.bad + "10"; border = C.bad; color = C.bad; }
                      } else if (isSelected) {
                        bg = C.brandSoft; border = C.brand; color = C.brand;
                      }
                      return (
                        <button key={oi}
                          disabled={isRevealed}
                          onClick={() => {
                            setSelected((p) => ({ ...p, [q.id]: opt }));
                            if (modality === "audio") speak(opt);
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${border}`,
                            background: bg, cursor: isRevealed ? "default" : "pointer",
                            fontFamily: FONT, fontSize: 13.5, color, textAlign: "left",
                            transition: "all .12s",
                          }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            border: `2px solid ${isRevealed && isCorrect ? C.visual : isSelected ? C.brand : C.line}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: (isRevealed && isCorrect) || isSelected ? C.brand : "transparent",
                          }}>
                            {(isSelected || (isRevealed && isCorrect)) && (
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                            )}
                          </span>
                          {opt}
                          {isRevealed && isCorrect && <CheckCircle2 size={14} color={C.visual} style={{ marginLeft: "auto" }} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {revealed.has(q.id) && (
                    <div style={{ padding: "12px 14px", background: C.visual + "0F",
                      border: `1px solid ${C.visual}30`, borderRadius: 10 }}>
                      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12,
                        color: C.visual, marginBottom: 4 }}>Explanation</div>
                      <div style={{ fontFamily: FONT, fontSize: 13, color: C.sub,
                        lineHeight: 1.55 }}>{q.explanation}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: "auto" }}>
                    <button onClick={goPrev} disabled={currentQ === 0}
                      style={{ border: `1px solid ${C.line}`, background: C.paper,
                        borderRadius: 8, padding: "8px 14px", cursor: currentQ === 0 ? "default" : "pointer",
                        opacity: currentQ === 0 ? 0.4 : 1, fontFamily: FONT, fontSize: 13,
                        color: C.ink, display: "flex", alignItems: "center", gap: 4 }}>
                      <ChevronLeft size={14} /> Prev
                    </button>

                    {!revealed.has(q.id) && (
                      <Button onClick={reveal} disabled={!selected[q.id]}
                        style={{ flex: 1, justifyContent: "center",
                          opacity: selected[q.id] ? 1 : 0.45 }}>
                        Check answer
                      </Button>
                    )}

                    <button onClick={goNext} disabled={currentQ === questions.length - 1}
                      style={{ border: `1px solid ${C.line}`, background: C.paper,
                        borderRadius: 8, padding: "8px 14px",
                        cursor: currentQ === questions.length - 1 ? "default" : "pointer",
                        opacity: currentQ === questions.length - 1 ? 0.4 : 1,
                        fontFamily: FONT, fontSize: 13, color: C.ink,
                        display: "flex", alignItems: "center", gap: 4 }}>
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Course Materials panel ────────────────────────────────────────────────────

function CourseMaterials({ courseId, onUpload }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState({}); // docId → { objectives, modules, loading, error }
  const [activeModule, setActiveModule] = useState(null); // { mod, doc }

  const isReal = courseId && UUID_RE.test(courseId);

  const fetchDocs = () => {
    if (!isReal) return;
    setLoading(true);
    fetch(`/api/documents/course?courseId=${encodeURIComponent(courseId)}`)
      .then((r) => r.json())
      .then(({ documents }) => setDocs(documents ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, [courseId]);

  const analyze = async (doc) => {
    setAnalyses((prev) => ({ ...prev, [doc.id]: { loading: true } }));
    try {
      const res = await fetch("/api/documents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, title: doc.title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalyses((prev) => ({ ...prev, [doc.id]: { objectives: data.objectives, modules: data.modules, loading: false } }));
    } catch (e) {
      setAnalyses((prev) => ({ ...prev, [doc.id]: { error: e.message, loading: false } }));
    }
  };

  return (
    <Card style={{ padding: 24, marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: C.ink }}>Course Materials</div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint, marginTop: 2 }}>
            {isReal ? "PDFs uploaded to this course — AI can analyze each for objectives and modules." : "Create this course in Supabase to enable document uploads."}
          </div>
        </div>
        {isReal && (
          <Button variant="soft" onClick={onUpload} style={{ flexShrink: 0 }}>
            <Upload size={15} /> Upload PDF
          </Button>
        )}
      </div>

      {!isReal ? (
        <div style={{ padding: "28px 0", textAlign: "center" }}>
          <FileText size={32} color={C.line} style={{ margin: "0 auto 10px" }} />
          <div style={{ fontFamily: FONT, fontSize: 14, color: C.faint }}>
            This is a demo course. Create a real course to upload materials.
          </div>
        </div>
      ) : loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "28px 0", color: C.faint, fontFamily: FONT, fontSize: 14 }}>
          <Loader size={16} className="spin" /> Loading documents…
        </div>
      ) : docs.length === 0 ? (
        <div style={{ padding: "28px 0", textAlign: "center" }}>
          <Upload size={32} color={C.line} style={{ margin: "0 auto 10px" }} />
          <div style={{ fontFamily: FONT, fontSize: 14, color: C.faint, marginBottom: 14 }}>
            No documents uploaded yet. Upload a PDF to get started.
          </div>
          <Button onClick={onUpload}><Upload size={14} /> Upload first PDF</Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {docs.map((doc) => {
            const analysis = analyses[doc.id];
            return (
              <div key={doc.id} style={{
                border: `1px solid ${C.line}`, borderRadius: 14,
                background: C.paper, overflow: "hidden",
              }}>
                {/* Document header row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
                  <FileText size={20} color={C.brand} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.title}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, marginTop: 2 }}>
                      {fmtDate(doc.created_at)} · {doc.chunkCount} chunk{doc.chunkCount !== 1 ? "s" : ""} embedded
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", color: C.faint, padding: 6 }}
                        title="Open PDF">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {doc.chunkCount > 0 && !analysis && (
                      <Button variant="soft" onClick={() => analyze(doc)}
                        style={{ fontSize: 13, padding: "6px 14px" }}>
                        <Sparkles size={13} /> Analyze
                      </Button>
                    )}
                    {analysis?.loading && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 13, color: C.faint }}>
                        <Loader size={13} className="spin" /> Analyzing…
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis results */}
                {analysis && !analysis.loading && (
                  <div style={{ borderTop: `1px solid ${C.line}`, padding: "18px 18px 20px" }}>
                    {analysis.error ? (
                      <div style={{ fontFamily: FONT, fontSize: 13, color: C.bad }}>{analysis.error}</div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Learning objectives */}
                        <div>
                          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 10 }}>
                            Learning Objectives
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {(analysis.objectives ?? []).map((obj, i) => (
                              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <CheckCircle2 size={14} color={C.visual} style={{ flexShrink: 0, marginTop: 2 }} />
                                <span style={{ fontFamily: FONT, fontSize: 13, color: C.ink, lineHeight: 1.45 }}>{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Student modules */}
                        <div>
                          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 10 }}>
                            Student Modules
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {(analysis.modules ?? []).map((mod, i) => {
                              const meta = MODULE_META[mod.type] ?? MODULE_META.reading;
                              const Icon = meta.icon;
                              return (
                                <div key={i}
                                  onClick={() => setActiveModule({ mod, doc })}
                                  style={{
                                    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
                                    borderRadius: 10, background: meta.color + "10",
                                    border: `1px solid ${meta.color}28`,
                                    cursor: "pointer", transition: "background .12s, transform .12s",
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = meta.color + "20"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = meta.color + "10"; e.currentTarget.style.transform = "none"; }}
                                >
                                  <div style={{
                                    width: 28, height: 28, borderRadius: 8, background: meta.color + "18",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                  }}>
                                    <Icon size={14} color={meta.color} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: C.ink }}>
                                      {mod.title}
                                    </div>
                                    <div style={{ fontFamily: FONT, fontSize: 12, color: C.sub, lineHeight: 1.4, marginTop: 2 }}>
                                      {mod.description}
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end",
                                    gap: 4, flexShrink: 0 }}>
                                    <span style={{ fontFamily: MONO, fontSize: 11, color: meta.color }}>
                                      {mod.estimatedMinutes}m
                                    </span>
                                    <span style={{ fontFamily: FONT, fontSize: 11, color: meta.color,
                                      fontWeight: 600 }}>Open →</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {doc.chunkCount === 0 && (
                  <div style={{ borderTop: `1px solid ${C.line}`, padding: "10px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 12, color: C.audio }}>
                      <AlertTriangle size={13} />
                      No chunks embedded yet — analysis unavailable. Check backend logs.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeModule && (
        <ModuleDetailModal
          mod={activeModule.mod}
          doc={activeModule.doc}
          onClose={() => setActiveModule(null)}
        />
      )}
    </Card>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

export function TeacherDashboard({ course, onBack, onStudent }) {
  const { kpis, topics, chatbot, accuracyOverTime, reteach } = course;
  const { user } = useAuth();
  const flagged = STUDENTS.filter((s) => s.status === "needs-support");
  const [showUpload, setShowUpload] = useState(false);
  const [materialsKey, setMaterialsKey] = useState(0);

  const handleUploaded = () => setMaterialsKey((k) => k + 1);

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

      {/* Course Materials — always visible */}
      <CourseMaterials
        key={materialsKey}
        courseId={course.id}
        onUpload={() => setShowUpload(true)}
      />

      {/* Analytics */}
      {!kpis ? (
        <Card style={{ padding: 48, marginTop: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>{course.emoji || "📚"}</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: C.ink, marginBottom: 8 }}>
            No student data yet for {course.title}
          </div>
          <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, maxWidth: 360, margin: "0 auto" }}>
            Invite students to start seeing mastery metrics here.
          </p>
        </Card>
      ) : (
        <>
          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 24 }}>
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

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          courseId={course.id}
          userId={user?.id}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
}
