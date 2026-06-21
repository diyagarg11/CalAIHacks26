import { useState } from "react";
import { C, FONT } from "./constants/tokens";
import { TEACHER_COURSES } from "./constants/data";
import { TopBar } from "./components/TopBar";
import { Button } from "./components/Button";
import { Landing } from "./pages/Landing";
import { Assessment } from "./pages/student/Assessment";
import { StudentHome } from "./pages/student/StudentHome";
import { Lesson } from "./pages/student/Lesson";
import { Quiz } from "./pages/student/Quiz";
import { QuizResult } from "./pages/student/QuizResult";
import { CourseDetail } from "./pages/student/CourseDetail";
import { TeacherCatalog } from "./pages/teacher/TeacherCatalog";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { StudentDetail } from "./pages/teacher/StudentDetail";

export default function App() {
  const [role, setRole] = useState(null);
  const [sView, setSView] = useState("assessment");
  const [prefs, setPrefs] = useState({ visual: 8, audio: 5, text: 6 });
  const [course, setCourse] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [mode, setMode] = useState("visual");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState({});
  const [tView, setTView] = useState("catalog");
  const [teacherCourses, setTeacherCourses] = useState(TEACHER_COURSES);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);

  const logout = () => { setRole(null); setSView("assessment"); setTView("catalog"); };

  // Weighted random mode selection — draws proportionally from prefs weights,
  // avoids repeating the same mode back-to-back if alternatives exist.
  const pickMode = (currentPrefs, lastMode = null) => {
    const entries = Object.entries(currentPrefs);
    const eligible = entries.length > 1 && lastMode
      ? entries.filter(([m]) => m !== lastMode)
      : entries;
    const total = eligible.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [m, w] of eligible) {
      r -= w;
      if (r <= 0) return m;
    }
    return eligible[eligible.length - 1][0];
  };

  // Nudge the weight for a given mode up or down based on quiz score.
  const updatePrefsFromQuiz = (quizMode, attempts) => {
    if (!attempts?.length) return;
    const pct = (attempts.filter((a) => a.correct).length / attempts.length) * 100;
    const delta = pct >= 70 ? 1 : pct < 40 ? -1 : 0;
    if (delta === 0) return;
    setPrefs((prev) => ({
      ...prev,
      [quizMode]: Math.max(1, Math.min(10, prev[quizMode] + delta)),
    }));
  };

  const finishAssessment = ({ assignedFormat, scores }) => {
    const next = { visual: 5, audio: 5, text: 5 };
    if (scores) {
      for (const f of ["visual", "audio", "text"]) {
        const pct = scores[f]?.pct;
        if (typeof pct === "number") next[f] = Math.max(1, Math.round(pct / 10));
      }
    }
    next[assignedFormat] = 10;
    setPrefs(next);
    setMode(assignedFormat);
    setSView("home");
  };

  let body;
  if (!role) body = <Landing onPick={(r) => { setRole(r); }} />;
  else if (role === "student") {
    const openCourse = (c) => { setCourse(c); setSView("courseDetail"); };
    const openTopic = (t) => { setActiveTopic(t); setMode(pickMode(prefs, mode)); setSView("quiz"); };
    const topBarRight = sView !== "assessment" && (
      <Button variant="ghost" onClick={() => setSView("home")} style={{ color: C.brand }}>My courses</Button>
    );
    body = (
      <>
        <TopBar role="student" onLogout={logout} right={topBarRight} />
        {sView === "assessment"   && <Assessment studentId={1} accommodationFlags={[]} onDone={finishAssessment} />}
        {sView === "home"         && <StudentHome prefs={prefs} onOpen={openCourse} />}
        {sView === "courseDetail" && <CourseDetail course={course} history={history} onSelectTopic={openTopic} onBack={() => setSView("home")} />}
        {sView === "lesson"       && <Lesson course={course} topic={activeTopic} mode={mode} setMode={setMode}
                                       onQuiz={() => setSView("quiz")} onBack={() => setSView("courseDetail")} />}
        {sView === "quiz"         && <Quiz topic={activeTopic} mode={mode} prefs={prefs} onBack={() => setSView("courseDetail")}
                                       onDone={(r) => {
                                         setHistory((prev) => ({ ...prev, [activeTopic.id]: [...(prev[activeTopic.id] || []), ...r.attempts] }));
                                         updatePrefsFromQuiz(mode, r.attempts);
                                         setResult(r);
                                         setSView("result");
                                       }} />}
        {sView === "result"       && <QuizResult result={result} onAgain={() => setSView("quiz")} onHome={() => setSView("courseDetail")} />}
      </>
    );
  } else {
    const topBarRight = tView === "dashboard"
      ? <Button variant="ghost" onClick={() => setTView("catalog")} style={{ color: C.brand }}>My courses</Button>
      : tView === "student"
      ? <Button variant="ghost" onClick={() => setTView("dashboard")} style={{ color: C.brand }}>Dashboard</Button>
      : null;
    body = (
      <>
        <TopBar role="teacher" onLogout={logout} right={topBarRight} />
        {tView === "catalog" && (
          <TeacherCatalog
            courses={teacherCourses}
            onSelect={(c) => { setActiveCourse(c); setTView("dashboard"); }}
            onCreateCourse={(c) => setTeacherCourses((prev) => [...prev, c])}
          />
        )}
        {tView === "dashboard" && (
          <TeacherDashboard
            course={activeCourse}
            onBack={() => setTView("catalog")}
            onStudent={(s) => { setActiveStudent(s); setTView("student"); }}
          />
        )}
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
