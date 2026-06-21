import { useState } from "react";
import { C, FONT } from "./constants/tokens";
import { COURSES } from "./constants/data";
import { TopBar } from "./components/TopBar";
import { Button } from "./components/Button";
import { Landing } from "./pages/Landing";
import { Assessment } from "./pages/student/Assessment";
import { StudentHome } from "./pages/student/StudentHome";
import { Lesson } from "./pages/student/Lesson";
import { Quiz } from "./pages/student/Quiz";
import { QuizResult } from "./pages/student/QuizResult";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { StudentDetail } from "./pages/teacher/StudentDetail";

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

  // The diagnostic assigns a measured starting format. Reflect it into `prefs`
  // so StudentHome opens in that mode (it picks the highest-scoring key).
  const finishAssessment = ({ assignedFormat, scores }) => {
    const next = { visual: 5, audio: 5, text: 5 };
    if (scores) {
      for (const f of ["visual", "audio", "text"]) {
        const pct = scores[f]?.pct;
        if (typeof pct === "number") next[f] = Math.max(1, Math.round(pct / 10));
      }
    }
    next[assignedFormat] = 10; // assigned format becomes the starting mode
    setPrefs(next);
    setMode(assignedFormat);
    setSView("home");
  };

  let body;
  if (!role) body = <Landing onPick={(r) => { setRole(r); }} />;
  else if (role === "student") {
    const start = (c) => { setCourse(c); setMode(c.mode); setSView("lesson"); };
    body = (
      <>
        <TopBar role="student" onLogout={logout}
          right={sView !== "assessment" && <Button variant="ghost" onClick={() => setSView("home")} style={{ color: C.brand }}>My courses</Button>} />
        {sView === "assessment" && <Assessment studentId={1} accommodationFlags={[]} onDone={finishAssessment} />}
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.9s linear infinite; }
        @media (max-width: 720px) {
          [style*="grid-template-columns: 1.3fr"], [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>
      {body}
    </div>
  );
}
