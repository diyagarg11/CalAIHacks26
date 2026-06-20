import React, { useState } from "react";
import {
  BookOpen, Headphones, Eye, GraduationCap, Users, Upload, Sparkles,
  TrendingUp, TrendingDown, Clock, Target, Lightbulb, AlertTriangle,
  CheckCircle2, ChevronRight, ChevronLeft, Play, Pause, ArrowRight,
  LogOut, Search, Award, Activity, Brain, Zap, Check, X, RotateCcw,
  Flame, HelpCircle, Volume2,
} from "lucide-react";
import {
  ScatterChart, Scatter, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

/* ----------------------------------------------------------------- */
/*  Design tokens                                                     */
/* ----------------------------------------------------------------- */
const C = {
  paper: "#FBFAF7",
  surface: "#FFFFFF",
  ink: "#1A1B2E",
  sub: "#5B5C72",
  faint: "#8A8B9C",
  line: "#E9E5DD",
  brand: "#5546D6",
  brandSoft: "#EEEBFB",
  text: "#5546D6",
  textSoft: "#EEEBFB",
  audio: "#E8852B",
  audioSoft: "#FCEEDD",
  visual: "#16A89B",
  visualSoft: "#DFF3F1",
  good: "#16A89B",
  warn: "#E8852B",
  bad: "#E0506A",
  badSoft: "#FBE6EA",
};

const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Inter', sans-serif";
const MONO = "'Space Mono', ui-monospace, monospace";

const MODES = {
  text:   { key: "text",   label: "Text",   verb: "Read it",  color: C.text,   soft: C.textSoft,   Icon: BookOpen },
  audio:  { key: "audio",  label: "Audio",  verb: "Hear it",  color: C.audio,  soft: C.audioSoft,  Icon: Headphones },
  visual: { key: "visual", label: "Visual", verb: "See it",   color: C.visual, soft: C.visualSoft, Icon: Eye },
};

/* ----------------------------------------------------------------- */
/*  Mock data                                                         */
/* ----------------------------------------------------------------- */
const COURSES = [
  { id: "alg", title: "Algebra I", emoji: "📐", lessons: 18, progress: 62, mode: "visual", color: C.visual },
  { id: "bio", title: "Intro to Biology", emoji: "🧬", lessons: 22, progress: 31, mode: "text", color: C.text },
  { id: "hist", title: "World History", emoji: "🏛️", lessons: 15, progress: 78, mode: "audio", color: C.audio },
];

const TOPICS = [
  { topic: "Linear Eq.", mastery: 88 },
  { topic: "Inequalities", mastery: 74 },
  { topic: "Functions", mastery: 61 },
  { topic: "Quadratics", mastery: 43 },
  { topic: "Polynomials", mastery: 52 },
  { topic: "Systems", mastery: 69 },
];

const STUDENTS = [
  { id: 1, name: "Maya Chen",    email: "maya.c@school.edu",   mastery: 91, improve: +6, hint: 12, recovery: 84, focus: 7.4, accuracy: 89, mode: "visual", status: "thriving" },
  { id: 2, name: "Liam Patel",   email: "liam.p@school.edu",   mastery: 78, improve: +3, hint: 28, recovery: 71, focus: 5.1, accuracy: 76, mode: "audio",  status: "on-track" },
  { id: 3, name: "Sofia Reyes",  email: "sofia.r@school.edu",  mastery: 44, improve: -2, hint: 61, recovery: 38, focus: 8.9, accuracy: 51, mode: "text",   status: "needs-support" },
  { id: 4, name: "Noah Kim",     email: "noah.k@school.edu",   mastery: 69, improve: +4, hint: 22, recovery: 66, focus: 4.6, accuracy: 71, mode: "visual", status: "on-track" },
  { id: 5, name: "Ava Johnson",  email: "ava.j@school.edu",    mastery: 38, improve: +1, hint: 54, recovery: 41, focus: 6.2, accuracy: 47, mode: "audio",  status: "needs-support" },
  { id: 6, name: "Ethan Brooks", email: "ethan.b@school.edu",  mastery: 85, improve: +5, hint: 15, recovery: 80, focus: 6.8, accuracy: 84, mode: "text",   status: "thriving" },
];

// chatbot interaction minutes over weeks (scatter, per spec)
const CHATBOT_TREND = [
  { week: 1, mins: 42, students: 18 }, { week: 2, mins: 51, students: 20 },
  { week: 3, mins: 68, students: 19 }, { week: 4, mins: 73, students: 21 },
  { week: 5, mins: 61, students: 17 }, { week: 6, mins: 88, students: 22 },
  { week: 7, mins: 95, students: 23 }, { week: 8, mins: 84, students: 20 },
];

const ACCURACY_TREND = [
  { week: "W1", acc: 58 }, { week: "W2", acc: 62 }, { week: "W3", acc: 60 },
  { week: "W4", acc: 67 }, { week: "W5", acc: 71 }, { week: "W6", acc: 74 },
  { week: "W7", acc: 73 }, { week: "W8", acc: 78 },
];

const STATUS = {
  thriving:        { label: "Thriving",      color: C.good, soft: C.visualSoft },
  "on-track":      { label: "On track",      color: C.brand, soft: C.brandSoft },
  "needs-support": { label: "Needs support", color: C.bad,  soft: C.badSoft },
};

/* ----------------------------------------------------------------- */
/*  Tiny shared UI                                                    */
/* ----------------------------------------------------------------- */
const Card = ({ children, style, ...p }) => (
  <div {...p} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, ...style }}>
    {children}
  </div>
);

function Button({ children, onClick, variant = "solid", color = C.brand, style, type, ...p }) {
  const base = {
    fontFamily: FONT, fontWeight: 600, fontSize: 14, borderRadius: 11, cursor: "pointer",
    padding: "11px 18px", display: "inline-flex", alignItems: "center", gap: 8,
    transition: "transform .12s ease, opacity .12s ease, background .12s ease", border: "none",
  };
  const styles = variant === "solid"
    ? { ...base, background: color, color: "#fff" }
    : variant === "soft"
    ? { ...base, background: C.surface, color: C.ink, border: `1px solid ${C.line}` }
    : { ...base, background: "transparent", color: C.sub, padding: "8px 10px" };
  return (
    <button
      type={type} onClick={onClick} {...p}
      style={{ ...styles, ...style }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

const ModeBadge = ({ mode, size = 13 }) => {
  const m = MODES[mode];
  const I = m.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: m.soft,
      color: m.color, padding: "4px 10px", borderRadius: 999, fontSize: size, fontWeight: 600 }}>
      <I size={size + 1} /> {m.label}
    </span>
  );
};

const Eyebrow = ({ children, color = C.faint }) => (
  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
    color, fontWeight: 700 }}>{children}</div>
);

/* The signature: the tri-modal mark */
const TriMark = ({ s = 34 }) => (
  <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden>
    <circle cx="20" cy="13" r="9.5" fill={C.text} opacity="0.92" />
    <circle cx="13" cy="26" r="9.5" fill={C.audio} opacity="0.92" />
    <circle cx="27" cy="26" r="9.5" fill={C.visual} opacity="0.92" />
  </svg>
);

/* ----------------------------------------------------------------- */
/*  Landing / role select                                             */
/* ----------------------------------------------------------------- */
function Landing({ onPick }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <TriMark s={44} />
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.ink, lineHeight: 1 }}>Triad</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: 1 }}>LEARN YOUR WAY</div>
        </div>
      </div>

      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: C.ink,
        textAlign: "center", maxWidth: 640, lineHeight: 1.08, margin: "0 0 14px" }}>
        One lesson. Three ways to learn it.
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 16, color: C.sub, textAlign: "center",
        maxWidth: 480, margin: "0 0 36px", lineHeight: 1.5 }}>
        Read it, hear it, or see it — Triad adapts every lesson to how each student learns best,
        and shows teachers exactly who needs help.
      </p>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { role: "student", Icon: GraduationCap, label: "I'm a student", sub: "Pick how you learn, then dive in", color: C.brand },
          { role: "teacher", Icon: Users, label: "I'm a teacher", sub: "Upload materials, watch the class grow", color: C.visual },
        ].map(({ role, Icon, label, sub, color }) => (
          <Card key={role} onClick={() => onPick(role)}
            style={{ width: 300, padding: 26, cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 30px rgba(26,27,46,.10)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: color,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icon size={26} color="#fff" />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: C.ink }}>{label}</div>
            <div style={{ fontFamily: FONT, fontSize: 14, color: C.sub, margin: "6px 0 18px" }}>{sub}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color, fontWeight: 600, fontSize: 14, fontFamily: FONT }}>
              Continue with login <ArrowRight size={16} />
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 34, fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: 1 }}>
        SECURE LOGIN · JWT · SSO READY
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  Top bar                                                           */
/* ----------------------------------------------------------------- */
function TopBar({ role, onLogout, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 22px", borderBottom: `1px solid ${C.line}`, background: C.surface, position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <TriMark s={28} />
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, color: C.ink }}>Triad</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.faint, border: `1px solid ${C.line}`,
          padding: "2px 7px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase" }}>{role}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {right}
        <Button variant="ghost" onClick={onLogout}><LogOut size={15} /> Sign out</Button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  STUDENT — learning-style assessment                               */
/* ----------------------------------------------------------------- */
function Assessment({ prefs, setPrefs, onDone }) {
  const top = Object.entries(prefs).sort((a, b) => b[1] - a[1])[0][0];
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "44px 22px" }}>
      <Eyebrow>STEP 1 · YOUR LEARNING PROFILE</Eyebrow>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.ink, margin: "8px 0 6px" }}>
        How do you learn best?
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: C.sub, margin: "0 0 28px" }}>
        Slide each mode to how well it works for you. We'll start with your strongest — then keep
        learning what fits as you go.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {Object.values(MODES).map((m) => {
          const v = prefs[m.key];
          return (
            <Card key={m.key} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: m.soft,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <m.Icon size={20} color={m.color} />
                  </div>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, color: C.ink }}>{m.label}</div>
                    <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint }}>{m.verb}</div>
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: m.color }}>{v}</div>
              </div>
              <input type="range" min={1} max={10} value={v}
                onChange={(e) => setPrefs({ ...prefs, [m.key]: +e.target.value })}
                style={{ width: "100%", accentColor: m.color, cursor: "pointer" }} />
            </Card>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
        <div style={{ fontFamily: FONT, fontSize: 14, color: C.sub }}>
          Starting mode: <ModeBadge mode={top} />
        </div>
        <Button onClick={onDone}>Start learning <ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  STUDENT — course home                                             */
/* ----------------------------------------------------------------- */
function StudentHome({ prefs, onOpen }) {
  const top = Object.entries(prefs).sort((a, b) => b[1] - a[1])[0][0];
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: 0 }}>Welcome back, Maya</h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: C.sub, margin: "6px 0 0" }}>
            Your strongest mode right now is <ModeBadge mode={top} /> — lessons open there by default.
          </p>
        </div>
        <Card style={{ padding: "14px 18px", display: "flex", gap: 22 }}>
          {[["Day streak", "6", C.audio, Flame], ["Mastery", "74%", C.visual, Award]].map(([l, v, c, I]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <I size={20} color={c} />
              <div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: C.ink }}>{v}</div>
                <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint }}>{l}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: C.ink, margin: "30px 0 14px" }}>Your courses</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {COURSES.map((c) => (
          <Card key={c.id} style={{ padding: 22, cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
            onClick={() => onOpen(c)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 26px rgba(26,27,46,.09)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 34 }}>{c.emoji}</span>
              <ModeBadge mode={c.mode} size={12} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: C.ink, margin: "14px 0 4px" }}>{c.title}</div>
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint, marginBottom: 16 }}>{c.lessons} lessons</div>
            <div style={{ height: 7, borderRadius: 999, background: C.line, overflow: "hidden" }}>
              <div style={{ width: `${c.progress}%`, height: "100%", background: c.color, borderRadius: 999 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.sub }}>{c.progress}% complete</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: c.color, fontFamily: FONT, fontSize: 13, fontWeight: 600 }}>
                Continue <ChevronRight size={15} />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  STUDENT — multimodal lesson (the heart of the product)            */
/* ----------------------------------------------------------------- */
function LessonContent({ mode }) {
  if (mode === "text")
    return (
      <div style={{ fontFamily: FONT, fontSize: 16, color: C.ink, lineHeight: 1.7 }}>
        <p style={{ marginTop: 0 }}>
          A <b>linear equation</b> describes a straight-line relationship between two quantities.
          In the form <span style={{ fontFamily: MONO, background: C.textSoft, padding: "1px 6px", borderRadius: 5 }}>y = mx + b</span>,
          the slope <b>m</b> tells you how steep the line is, and <b>b</b> tells you where it crosses the y-axis.
        </p>
        <p>
          To solve for an unknown, keep the equation balanced: whatever you do to one side, do to the other.
          If <span style={{ fontFamily: MONO }}>2x + 3 = 11</span>, subtract 3 from both sides to get
          <span style={{ fontFamily: MONO }}> 2x = 8</span>, then divide by 2 to find <b>x = 4</b>.
        </p>
      </div>
    );
  if (mode === "audio")
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.audioSoft,
          borderRadius: 14, padding: 18 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.audio,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
        <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, lineHeight: 1.6, marginTop: 16 }}>
          <b style={{ color: C.ink }}>Transcript.</b> "Think of a linear equation as a recipe for a straight line.
          The slope is how fast it climbs, and the intercept is where it begins…"
        </p>
      </div>
    );
  // visual
  return (
    <div>
      <svg viewBox="0 0 300 200" style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto" }}>
        <defs>
          <pattern id="g" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" fill="none" stroke={C.line} strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="20" y="10" width="260" height="160" fill="url(#g)" rx="8" />
        <line x1="20" y1="90" x2="280" y2="90" stroke={C.faint} strokeWidth="1.5" />
        <line x1="150" y1="10" x2="150" y2="170" stroke={C.faint} strokeWidth="1.5" />
        <line x1="40" y1="150" x2="270" y2="40" stroke={C.visual} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="150" cy="90" r="5" fill={C.visual} />
        <circle cx="210" cy="63" r="5" fill={C.visual} />
        <text x="216" y="58" fontFamily={MONO} fontSize="11" fill={C.ink}>(2, 4)</text>
        <text x="255" y="103" fontFamily={MONO} fontSize="11" fill={C.faint}>x</text>
        <text x="156" y="24" fontFamily={MONO} fontSize="11" fill={C.faint}>y</text>
      </svg>
      <p style={{ fontFamily: FONT, fontSize: 14, color: C.sub, lineHeight: 1.6, textAlign: "center", marginTop: 8 }}>
        Each step up the line is the <b style={{ color: C.visual }}>slope</b>. Drag along to see how <b>x</b> and <b>y</b> move together.
      </p>
    </div>
  );
}

function Lesson({ course, mode, setMode, onQuiz, onBack }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "30px 22px" }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 8 }}><ChevronLeft size={16} /> All courses</Button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 24 }}>{course.emoji}</span>
        <Eyebrow>{course.title} · LESSON 7</Eyebrow>
      </div>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: "2px 0 18px" }}>
        Solving Linear Equations
      </h1>

      {/* The signature switcher */}
      <div style={{ display: "inline-flex", background: C.surface, border: `1px solid ${C.line}`,
        borderRadius: 14, padding: 5, gap: 4, marginBottom: 20 }}>
        {Object.values(MODES).map((m) => {
          const on = mode === m.key;
          return (
            <button key={m.key} onClick={() => setMode(m.key)}
              style={{ display: "flex", alignItems: "center", gap: 7, border: "none", cursor: "pointer",
                padding: "9px 15px", borderRadius: 10, fontFamily: FONT, fontWeight: 600, fontSize: 14,
                background: on ? m.color : "transparent", color: on ? "#fff" : C.sub, transition: "all .15s" }}>
              <m.Icon size={16} /> {m.label}
            </button>
          );
        })}
      </div>

      <Card style={{ padding: 26, minHeight: 210 }}>
        <LessonContent mode={mode} />
      </Card>

      <Card style={{ padding: "14px 18px", marginTop: 16, display: "flex", alignItems: "center",
        gap: 10, background: C.brandSoft, border: "none" }}>
        <Sparkles size={18} color={C.brand} />
        <span style={{ fontFamily: FONT, fontSize: 14, color: C.ink }}>
          Found 3 extra practice problems and a related reading for this topic.
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.brand, marginLeft: "auto" }}>via Browserbase</span>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
        <Button onClick={onQuiz}>Check your understanding <ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  STUDENT — quiz / practice                                         */
/* ----------------------------------------------------------------- */
const QUESTIONS = [
  { q: "Solve for x:  3x − 5 = 16", options: ["x = 5", "x = 7", "x = 11", "x = 3"], correct: 1,
    hint: "Add 5 to both sides first, then divide by 3." },
  { q: "What is the slope of  y = −2x + 4 ?", options: ["4", "−2", "2", "−4"], correct: 1,
    hint: "In y = mx + b, the slope is the number multiplied by x." },
];

function Quiz({ onDone, onBack }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const q = QUESTIONS[i];
  const answered = picked !== null;
  const correct = answered && picked === q.correct;

  const next = () => {
    if (i + 1 < QUESTIONS.length) { setI(i + 1); setPicked(null); setShowHint(false); }
    else onDone({ score: score + (correct ? 1 : 0), total: QUESTIONS.length, hintsUsed });
  };
  const choose = (idx) => { if (!answered) { setPicked(idx); if (idx === q.correct) setScore((s) => s + 1); } };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "30px 22px" }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 10 }}><ChevronLeft size={16} /> Back to lesson</Button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Eyebrow>PRACTICE · {i + 1} OF {QUESTIONS.length}</Eyebrow>
        <span style={{ fontFamily: MONO, fontSize: 12, color: C.faint }}>Hints used: {hintsUsed}</span>
      </div>

      <Card style={{ padding: 26 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, color: C.ink, marginBottom: 20 }}>{q.q}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, idx) => {
            const isC = answered && idx === q.correct;
            const isW = answered && idx === picked && idx !== q.correct;
            return (
              <button key={idx} onClick={() => choose(idx)} disabled={answered}
                style={{ textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: 12, fontFamily: MONO, fontSize: 15, fontWeight: 700,
                  cursor: answered ? "default" : "pointer", transition: "all .15s",
                  background: isC ? C.visualSoft : isW ? C.badSoft : C.surface,
                  color: isC ? C.good : isW ? C.bad : C.ink,
                  border: `1.5px solid ${isC ? C.good : isW ? C.bad : C.line}` }}>
                {opt}
                {isC && <Check size={18} />} {isW && <X size={18} />}
              </button>
            );
          })}
        </div>

        {!answered && (
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
              {correct ? "Nice — that's right." : "Not quite — review the hint and keep going."}
            </span>
            <Button onClick={next} color={correct ? C.good : C.brand}>
              {i + 1 < QUESTIONS.length ? "Next question" : "See results"} <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function QuizResult({ result, onAgain, onHome }) {
  const pct = Math.round((result.score / result.total) * 100);
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 22px", textAlign: "center" }}>
      <div style={{ width: 84, height: 84, borderRadius: "50%", background: C.visualSoft, margin: "0 auto 20px",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Award size={40} color={C.visual} />
      </div>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.ink, margin: "0 0 6px" }}>
        {result.score} / {result.total} correct
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: C.sub, margin: "0 0 26px" }}>
        That's {pct}% on this practice set. Your mastery and recovery rate just updated on your teacher's dashboard.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 22, marginBottom: 30 }}>
        {[["Score", `${pct}%`, C.visual], ["Hints used", result.hintsUsed, C.audio]].map(([l, v, c]) => (
          <div key={l}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: c }}>{v}</div>
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.faint }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Button variant="soft" onClick={onAgain}><RotateCcw size={15} /> Try again</Button>
        <Button onClick={onHome}>Back to courses</Button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  TEACHER — dashboard                                               */
/* ----------------------------------------------------------------- */
function Stat({ label, value, sub, Icon, color, trend }) {
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "1A",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={19} color={color} />
        </div>
        {trend != null && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: MONO, fontSize: 12,
            fontWeight: 700, color: trend >= 0 ? C.good : C.bad }}>
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.ink, marginTop: 12 }}>{value}</div>
      <div style={{ fontFamily: FONT, fontSize: 13, color: C.sub }}>{label}</div>
      {sub && <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint, marginTop: 2 }}>{sub}</div>}
    </Card>
  );
}

const chartTip = {
  contentStyle: { fontFamily: FONT, fontSize: 12, borderRadius: 10, border: `1px solid ${C.line}` },
  labelStyle: { color: C.ink, fontWeight: 600 },
};

function TeacherDashboard({ onStudent }) {
  const flagged = STUDENTS.filter((s) => s.status === "needs-support");
  return (
    <div style={{ maxWidth: 1140, margin: "0 auto", padding: "30px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <Eyebrow>ALGEBRA I · PERIOD 3 · 24 STUDENTS</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, margin: "6px 0 0" }}>Class dashboard</h1>
        </div>
        <Button variant="soft"><Upload size={16} /> Upload materials</Button>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 22 }}>
        <Stat label="Class mastery" value="67%" Icon={Target} color={C.brand} trend={+5} />
        <Stat label="Avg. accuracy" value="71%" Icon={CheckCircle2} color={C.visual} trend={+4} />
        <Stat label="Focused time / wk" value="6.2h" sub="active, not idle" Icon={Clock} color={C.audio} trend={+8} />
        <Stat label="Hint dependency" value="32%" Icon={Lightbulb} color={C.bad} trend={-3} />
      </div>

      {/* charts */}
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
              <Scatter data={CHATBOT_TREND} fill={C.brand}>
                {CHATBOT_TREND.map((_, idx) => <Cell key={idx} fill={C.brand} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 8 }}>Accuracy over time</div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={ACCURACY_TREND} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid stroke={C.line} strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontFamily: MONO, fontSize: 11, fill: C.faint }} />
              <YAxis domain={[40, 90]} tick={{ fontFamily: MONO, fontSize: 11, fill: C.faint }} />
              <Tooltip {...chartTip} />
              <Line type="monotone" dataKey="acc" stroke={C.visual} strokeWidth={3} dot={{ r: 3, fill: C.visual }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Mastery by topic */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 8 }}>Mastery by topic</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={TOPICS} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={C.line} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontFamily: MONO, fontSize: 11, fill: C.faint }} />
              <YAxis type="category" dataKey="topic" width={78} tick={{ fontFamily: FONT, fontSize: 12, fill: C.sub }} />
              <Tooltip {...chartTip} cursor={{ fill: C.paper }} />
              <Bar dataKey="mastery" radius={[0, 6, 6, 0]} barSize={16}>
                {TOPICS.map((t, idx) => (
                  <Cell key={idx} fill={t.mastery < 50 ? C.bad : t.mastery < 70 ? C.audio : C.visual} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AI reteach plan */}
        <Card style={{ padding: 20, background: C.ink, border: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Sparkles size={18} color={C.audio} />
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: "#fff" }}>Suggested 10-min reteach</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#A8A9C8", letterSpacing: 1, marginBottom: 8 }}>TOP WEAK CONCEPTS</div>
          {[
            ["Quadratics", "43%", "Most miss factoring before applying the formula."],
            ["Polynomials", "52%", "Sign errors when combining like terms."],
            ["Functions", "61%", "Confusing domain with range."],
          ].map(([t, m, why], idx) => (
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

      {/* Student table */}
      <StudentTable onStudent={onStudent} />
    </div>
  );
}

function Avatar({ name, size = 38 }) {
  const initials = name.split(" ").map((n) => n[0]).join("");
  const colors = [C.brand, C.visual, C.audio, C.bad];
  const c = colors[name.length % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: c + "22", color: c,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      fontFamily: DISPLAY, fontWeight: 700, fontSize: size * 0.38 }}>{initials}</div>
  );
}

function StudentTable({ onStudent }) {
  const [q, setQ] = useState("");
  const rows = STUDENTS.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card style={{ padding: 0, marginTop: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px" }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.ink }}>All students</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.paper,
          border: `1px solid ${C.line}`, borderRadius: 9, padding: "7px 11px" }}>
          <Search size={15} color={C.faint} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students"
            style={{ border: "none", background: "transparent", outline: "none", fontFamily: FONT, fontSize: 13, color: C.ink, width: 150 }} />
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ background: C.paper }}>
              {["Student", "Mastery", "Δ / wk", "Best mode", "Focus", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "11px 20px", fontFamily: MONO, fontSize: 11,
                  letterSpacing: 1, textTransform: "uppercase", color: C.faint, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const st = STATUS[s.status];
              return (
                <tr key={s.id} onClick={() => onStudent(s)}
                  style={{ borderTop: `1px solid ${C.line}`, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.paper)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <Avatar name={s.name} size={32} />
                      <div>
                        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: C.ink }}>{s.name}</div>
                        <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.ink }}>{s.mastery}%</td>
                  <td style={{ padding: "12px 20px", fontFamily: MONO, fontSize: 13, fontWeight: 700,
                    color: s.improve >= 0 ? C.good : C.bad }}>{s.improve >= 0 ? "+" : ""}{s.improve}%</td>
                  <td style={{ padding: "12px 20px" }}><ModeBadge mode={s.mode} size={11} /></td>
                  <td style={{ padding: "12px 20px", fontFamily: MONO, fontSize: 13, color: C.sub }}>{s.focus}h</td>
                  <td style={{ padding: "12px 20px" }}>
                    <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: st.color,
                      background: st.soft, padding: "4px 10px", borderRadius: 999 }}>{st.label}</span>
                  </td>
                  <td style={{ padding: "12px 20px" }}><ChevronRight size={16} color={C.faint} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------------- */
/*  TEACHER — student detail                                          */
/* ----------------------------------------------------------------- */
function StudentDetail({ student, onBack }) {
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
    </div>
  );
}

/* ----------------------------------------------------------------- */
/*  Root                                                              */
/* ----------------------------------------------------------------- */
export default function App() {
  const [role, setRole] = useState(null);
  const [sView, setSView] = useState("assessment");
  const [prefs, setPrefs] = useState({ visual: 8, audio: 5, text: 6 });
  const [course, setCourse] = useState(COURSES[0]);
  const [mode, setMode] = useState("visual");
  const [result, setResult] = useState(null);
  const [tView, setTView] = useState("dashboard");
  const [activeStudent, setActiveStudent] = useState(null);

  const logout = () => { setRole(null); setSView("assessment"); setTView("dashboard"); };

  let body;
  if (!role) body = <Landing onPick={(r) => { setRole(r); }} />;
  else if (role === "student") {
    const start = (c) => { setCourse(c); setMode(c.mode); setSView("lesson"); };
    body = (
      <>
        <TopBar role="student" onLogout={logout}
          right={sView !== "assessment" && <Button variant="ghost" onClick={() => setSView("home")} style={{ color: C.brand }}>My courses</Button>} />
        {sView === "assessment" && <Assessment prefs={prefs} setPrefs={setPrefs} onDone={() => setSView("home")} />}
        {sView === "home" && <StudentHome prefs={prefs} onOpen={start} />}
        {sView === "lesson" && <Lesson course={course} mode={mode} setMode={setMode}
          onQuiz={() => setSView("quiz")} onBack={() => setSView("home")} />}
        {sView === "quiz" && <Quiz onBack={() => setSView("lesson")}
          onDone={(r) => { setResult(r); setSView("result"); }} />}
        {sView === "result" && <QuizResult result={result} onAgain={() => setSView("quiz")} onHome={() => setSView("home")} />}
      </>
    );
  } else {
    body = (
      <>
        <TopBar role="teacher" onLogout={logout}
          right={tView === "student" && <Button variant="ghost" onClick={() => setTView("dashboard")} style={{ color: C.brand }}>Dashboard</Button>} />
        {tView === "dashboard" && <TeacherDashboard onStudent={(s) => { setActiveStudent(s); setTView("student"); }} />}
        {tView === "student" && <StudentDetail student={activeStudent} onBack={() => setTView("dashboard")} />}
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.paper, fontFamily: FONT, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible, input:focus-visible, [tabindex]:focus-visible { outline: 2px solid ${C.brand}; outline-offset: 2px; }
        input[type=range] { height: 6px; }
        @media (max-width: 720px) {
          [style*="grid-template-columns: 1.3fr"], [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>
      {body}
    </div>
  );
}
