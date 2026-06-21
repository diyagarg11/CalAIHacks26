import { useState } from "react";
import { Search, Plus, Users, ChevronRight, X, Loader } from "lucide-react";
import { C, DISPLAY, FONT, MONO } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Eyebrow } from "../../components/Eyebrow";
import { useAuth } from "../../auth/AuthProvider";

const PALETTE = [C.visual, C.brand, C.audio, C.bad];
const EMOJIS = ["📚", "🔬", "🌍", "💡", "🎨", "⚗️", "📊", "🧮"];

function CreateCourseModal({ onClose, onCreate }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), teacherId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");
      onCreate({ title: data.course.title, description: description.trim(), id: data.course.id });
      onClose();
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(26,27,46,.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: 20, padding: 32, width: "100%", maxWidth: 460,
          boxShadow: "0 24px 60px rgba(26,27,46,.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: C.ink }}>New course</div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.faint, display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>
              Course title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AP Chemistry"
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 11,
                border: `1.5px solid ${C.line}`, fontFamily: FONT, fontSize: 15,
                color: C.ink, outline: "none", background: C.paper,
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.brand)}
              onBlur={(e) => (e.target.style.borderColor = C.line)}
            />
          </div>

          <div>
            <label style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>
              Description <span style={{ color: C.faint, fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics will students cover?"
              rows={3}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 11,
                border: `1.5px solid ${C.line}`, fontFamily: FONT, fontSize: 14,
                color: C.ink, outline: "none", background: C.paper, resize: "vertical",
                boxSizing: "border-box", lineHeight: 1.5,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.brand)}
              onBlur={(e) => (e.target.style.borderColor = C.line)}
            />
          </div>

          {err && <p style={{ fontFamily: FONT, fontSize: 13, color: C.bad, margin: 0 }}>{err}</p>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <Button variant="soft" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} style={{ opacity: title.trim() && !saving ? 1 : 0.5 }}>
              {saving ? <><Loader size={14} className="spin" /> Creating…</> : "Create course"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TeacherCatalog({ courses, onSelect, onCreateCourse }) {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 22px" }}>
      {/* Header */}
      <Eyebrow style={{ marginBottom: 6 }}>YOUR COURSES</Eyebrow>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.ink, margin: 0 }}>
          Select a course to view metrics
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New course
        </Button>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: C.surface,
        border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "11px 16px", marginBottom: 24,
        maxWidth: 400,
      }}>
        <Search size={17} color={C.faint} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses…"
          style={{
            border: "none", background: "transparent", outline: "none",
            fontFamily: FONT, fontSize: 15, color: C.ink, width: "100%",
          }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", color: C.faint }}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.faint, fontFamily: FONT, fontSize: 15 }}>
          No courses match "{query}"
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
          {filtered.map((c) => (
            <Card
              key={c.id}
              onClick={() => onSelect(c)}
              style={{ padding: 24, cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(26,27,46,.10)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: (c.color || C.brand) + "18",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                }}>
                  {c.emoji || "📚"}
                </div>
                {c.period ? (
                  <span style={{
                    fontFamily: MONO, fontSize: 11, color: c.color || C.brand,
                    background: (c.color || C.brand) + "14", padding: "4px 10px",
                    borderRadius: 999, fontWeight: 700, letterSpacing: 0.5,
                  }}>
                    {c.period}
                  </span>
                ) : (
                  <span style={{
                    fontFamily: MONO, fontSize: 11, color: C.faint,
                    background: C.paper, padding: "4px 10px",
                    borderRadius: 999, fontWeight: 700, border: `1px solid ${C.line}`,
                  }}>
                    NEW
                  </span>
                )}
              </div>

              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: C.ink, marginBottom: 6 }}>
                {c.title}
              </div>
              {c.description && (
                <div style={{ fontFamily: FONT, fontSize: 13.5, color: C.sub, lineHeight: 1.5, marginBottom: 16 }}>
                  {c.description}
                </div>
              )}

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: c.description ? 0 : 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 13, color: C.faint }}>
                  {c.students ? (
                    <><Users size={13} /> {c.students} students</>
                  ) : (
                    <span style={{ color: C.faint }}>No students yet</span>
                  )}
                </div>
                <span style={{
                  display: "flex", alignItems: "center", gap: 4,
                  color: c.color || C.brand, fontFamily: FONT, fontSize: 13, fontWeight: 600,
                }}>
                  View metrics <ChevronRight size={15} />
                </span>
              </div>

              {/* Mastery bar (only for courses with data) */}
              {c.kpis && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ height: 5, borderRadius: 999, background: C.line, overflow: "hidden" }}>
                    <div style={{ width: `${c.kpis.mastery}%`, height: "100%", background: c.color, borderRadius: 999 }} />
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, marginTop: 5 }}>
                    {c.kpis.mastery}% class mastery
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onCreate={(fields) => {
            const idx = courses.length;
            onCreateCourse({
              emoji: EMOJIS[idx % EMOJIS.length],
              color: PALETTE[idx % PALETTE.length],
              students: 0,
              period: null,
              kpis: null,
              topics: [],
              chatbot: [],
              accuracyOverTime: [],
              reteach: [],
              ...fields,
              // id comes from fields (Supabase UUID returned by the API)
            });
          }}
        />
      )}
    </div>
  );
}
