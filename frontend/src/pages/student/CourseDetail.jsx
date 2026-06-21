import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Check, X,
  ChevronDown, ChevronUp, BookOpen, Headphones, Eye, Search,
} from "lucide-react";
import { ChatBot } from "../../components/ChatBot";
import { C, DISPLAY, FONT, MONO } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Eyebrow } from "../../components/Eyebrow";

const STATUS_META = {
  complete:      { label: "Complete",    color: C.good,  bg: C.visualSoft, btnLabel: "Review" },
  "in-progress": { label: "In Progress", color: C.brand, bg: C.brandSoft,  btnLabel: "Continue" },
  "not-started": { label: "Not Started", color: C.faint, bg: C.paper,      btnLabel: "Start" },
};

const MODE_META = {
  text:   { label: "Text",   color: C.brand,  bg: C.brandSoft,  Icon: BookOpen },
  audio:  { label: "Audio",  color: C.audio,  bg: C.audioSoft,  Icon: Headphones },
  visual: { label: "Visual", color: C.visual, bg: C.visualSoft, Icon: Eye },
};

function ModePill({ mode }) {
  const m = MODE_META[mode] || MODE_META.text;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
      background: m.bg, color: m.color, padding: "3px 9px", borderRadius: 999,
      fontFamily: FONT, fontSize: 11, fontWeight: 600,
    }}>
      <m.Icon size={10} /> {m.label}
    </span>
  );
}

function MasteryRing({ value, color, size = 52 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4.5} textAnchor="middle"
        fontFamily={MONO} fontSize={11} fontWeight={700} fill={color}>
        {value}%
      </text>
    </svg>
  );
}

function InlineAttemptList({ attempts }) {
  return (
    <div style={{ marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      {attempts.map((a, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            background: a.correct ? C.visualSoft : C.badSoft,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {a.correct
              ? <Check size={12} color={C.good} strokeWidth={2.5} />
              : <X size={12} color={C.bad} strokeWidth={2.5} />}
          </div>
          <span style={{ flex: 1, fontFamily: FONT, fontSize: 13, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {a.q}
          </span>
          <ModePill mode={a.mode} />
        </div>
      ))}
    </div>
  );
}

export function CourseDetail({ course, history = {}, onSelectTopic, onBack }) {
  const [expanded, setExpanded] = useState({});
  const [historySearch, setHistorySearch] = useState("");

  const completed = course.topics.filter((t) => t.status === "complete").length;
  const avgMastery = Math.round(course.topics.reduce((s, t) => s + t.mastery, 0) / course.topics.length);

  const toggleExpanded = (e, topicId) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  // Flat list of all attempts enriched with topic metadata
  const allAttempts = course.topics.flatMap((topic) =>
    (history[topic.id] || []).map((a) => ({ ...a, topicTitle: topic.title, topicId: topic.id }))
  );

  const totalCorrect = allAttempts.filter((a) => a.correct).length;

  const filteredAttempts = historySearch.trim()
    ? allAttempts.filter((a) => a.topicTitle.toLowerCase().includes(historySearch.toLowerCase()))
    : allAttempts;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "30px 22px" }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 14 }}>
        <ChevronLeft size={16} /> My courses
      </Button>

      {/* Course header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <div style={{
          width: 62, height: 62, borderRadius: 16, fontSize: 30,
          background: course.color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {course.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.ink, margin: 0 }}>{course.title}</h1>
          <div style={{ fontFamily: FONT, fontSize: 14, color: C.sub, marginTop: 4 }}>
            {completed} of {course.topics.length} topics complete · {avgMastery}% avg mastery
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: course.color }}>{course.progress}%</div>
          <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint }}>overall progress</div>
        </div>
      </div>

      <div style={{ height: 7, borderRadius: 999, background: C.line, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ width: `${course.progress}%`, height: "100%", background: course.color, borderRadius: 999 }} />
      </div>

      {/* ── Topics ── */}
      <Eyebrow style={{ marginBottom: 14 }}>TOPICS</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {course.topics.map((topic, idx) => {
          const meta = STATUS_META[topic.status];
          const topicHistory = history[topic.id] || [];
          const correctCount = topicHistory.filter((a) => a.correct).length;
          const isExpanded = expanded[topic.id];

          return (
            <Card
              key={topic.id}
              style={{ padding: "18px 20px", cursor: "pointer", transition: "transform .13s, box-shadow .13s" }}
              onClick={() => onSelectTopic(topic)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,27,46,.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: meta.bg, border: `1.5px solid ${meta.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: MONO, fontWeight: 700, fontSize: 13, color: meta.color,
                }}>
                  {idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>{topic.title}</span>
                    <span style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 600, color: meta.color, background: meta.bg, padding: "3px 9px", borderRadius: 999 }}>
                      {meta.label}
                    </span>
                    {topicHistory.length > 0 && (
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: correctCount === topicHistory.length ? C.good : C.audio }}>
                        {correctCount}/{topicHistory.length} correct
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: C.sub, marginTop: 3 }}>{topic.description}</div>
                </div>

                <MasteryRing value={topic.mastery} color={topic.mastery >= 70 ? C.good : topic.mastery >= 50 ? C.audio : C.bad} />

                <Button
                  variant={topic.status === "complete" ? "soft" : "solid"}
                  color={topic.status === "complete" ? C.good : C.brand}
                  style={{ flexShrink: 0, fontSize: 13, padding: "9px 14px" }}
                  onClick={(e) => { e.stopPropagation(); onSelectTopic(topic); }}
                >
                  {meta.btnLabel} <ChevronRight size={14} />
                </Button>
              </div>

              <div style={{ marginTop: 12, height: 4, borderRadius: 999, background: C.line, overflow: "hidden" }}>
                <div style={{
                  width: `${topic.mastery}%`, height: "100%", borderRadius: 999,
                  background: topic.mastery >= 70 ? C.good : topic.mastery >= 50 ? C.audio : C.bad,
                  transition: "width .4s ease",
                }} />
              </div>

              {topicHistory.length > 0 && (
                <button
                  onClick={(e) => toggleExpanded(e, topic.id)}
                  style={{
                    marginTop: 10, display: "flex", alignItems: "center", gap: 6,
                    border: "none", background: "transparent", cursor: "pointer", padding: 0,
                    fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: C.faint,
                  }}
                >
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {topicHistory.length} past {topicHistory.length === 1 ? "attempt" : "attempts"}
                </button>
              )}

              {isExpanded && topicHistory.length > 0 && (
                <InlineAttemptList attempts={topicHistory} />
              )}
            </Card>
          );
        })}
      </div>

      {/* ── Performance History ── */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <Eyebrow>PERFORMANCE HISTORY</Eyebrow>
            {allAttempts.length > 0 && (
              <div style={{ fontFamily: FONT, fontSize: 13, color: C.sub, marginTop: 4 }}>
                {allAttempts.length} {allAttempts.length === 1 ? "question" : "questions"} attempted &nbsp;·&nbsp;
                <span style={{ color: totalCorrect === allAttempts.length ? C.good : C.audio, fontWeight: 600 }}>
                  {Math.round((totalCorrect / allAttempts.length) * 100)}% correct
                </span>
              </div>
            )}
          </div>

          {allAttempts.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, background: C.surface,
              border: `1.5px solid ${C.line}`, borderRadius: 11, padding: "9px 13px",
            }}>
              <Search size={15} color={C.faint} />
              <input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by topic…"
                style={{
                  border: "none", background: "transparent", outline: "none",
                  fontFamily: FONT, fontSize: 14, color: C.ink, width: 180,
                }}
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch("")}
                  style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", color: C.faint, padding: 0 }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          {allAttempts.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: C.faint, fontFamily: FONT, fontSize: 14 }}>
              No questions attempted yet — complete a topic quiz to see your history here.
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div style={{ padding: "32px 24px", textAlign: "center", color: C.faint, fontFamily: FONT, fontSize: 14 }}>
              No attempts matching "{historySearch}"
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "28px 1fr auto auto",
                gap: "0 16px", padding: "10px 20px",
                background: C.paper, borderBottom: `1px solid ${C.line}`,
              }}>
                {["", "Question", "Topic", "Mode"].map((h) => (
                  <div key={h} style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.faint, textTransform: "uppercase" }}>
                    {h}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {filteredAttempts.map((a, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid", gridTemplateColumns: "28px 1fr auto auto",
                    gap: "0 16px", padding: "12px 20px", alignItems: "center",
                    borderBottom: idx < filteredAttempts.length - 1 ? `1px solid ${C.line}` : "none",
                    background: idx % 2 === 0 ? C.surface : C.paper + "80",
                  }}
                >
                  {/* Result icon */}
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: a.correct ? C.visualSoft : C.badSoft,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {a.correct
                      ? <Check size={13} color={C.good} strokeWidth={2.5} />
                      : <X size={13} color={C.bad} strokeWidth={2.5} />}
                  </div>

                  {/* Question text */}
                  <span style={{
                    fontFamily: FONT, fontSize: 13.5, color: C.ink,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {a.q}
                  </span>

                  {/* Topic pill */}
                  <span style={{
                    fontFamily: FONT, fontSize: 11.5, fontWeight: 600,
                    color: C.sub, background: C.paper,
                    border: `1px solid ${C.line}`,
                    padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap",
                  }}>
                    {a.topicTitle}
                  </span>

                  {/* Mode pill */}
                  <ModePill mode={a.mode} />
                </div>
              ))}
            </>
          )}
        </Card>
      </div>

      <ChatBot course={course} />
    </div>
  );
}
