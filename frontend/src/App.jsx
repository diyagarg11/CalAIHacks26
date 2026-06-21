import { useState, useEffect } from "react";
import { C, FONT } from "./constants/tokens";
import { TEACHER_COURSES } from "./constants/data";
import { ACCOMMODATION_RULES } from "./constants/diagnostic";
import { TopBar } from "./components/TopBar";
import { Button } from "./components/Button";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Assessment } from "./pages/student/Assessment";
import { StudentHome } from "./pages/student/StudentHome";
import { Lesson } from "./pages/student/Lesson";
import { Quiz } from "./pages/student/Quiz";
import { QuizResult } from "./pages/student/QuizResult";
import { CourseDetail } from "./pages/student/CourseDetail";
import { TeacherCatalog } from "./pages/teacher/TeacherCatalog";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { StudentDetail } from "./pages/teacher/StudentDetail";
import { IepRoster } from "./pages/teacher/IepRoster";
import { useAuth } from "./auth/AuthProvider";

export default function App() {
  const { user, role: authRole, loading, signOut } = useAuth();

  // pendingRole is set when user picks a role on Landing but isn't logged in yet
  const [pendingRole, setPendingRole] = useState(null);

  // Derive the active role: prefer the one from the auth session, fall back to pending
  const role = authRole ?? pendingRole;
  const [sView, setSView] = useState(null); // null = waiting for diagnostic check
  const [diagChecked, setDiagChecked] = useState(false);
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
  const [accommodationFlags, setAccommodationFlags] = useState([]);
  const [studentIeps, setStudentIeps] = useState({});

  const handleIepLoad = (studentId, flags) => {
    setStudentIeps((prev) => ({ ...prev, [studentId]: flags }));
    // If this student is the logged-in student, apply immediately
    if (user?.id && String(user.id) === String(studentId)) setAccommodationFlags(flags);
  };

  const logout = () => {
    signOut();
    setPendingRole(null);
    setSView(null);
    setDiagChecked(false);
    setTView("catalog");
  };

  // On teacher login: fetch real Supabase courses and merge with mock courses
  useEffect(() => {
    if (!user || role !== "teacher") return;
    fetch(`/api/courses?teacherId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then(({ courses }) => {
        if (!courses?.length) return;
        setTeacherCourses((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const palette = [C.visual, C.brand, C.audio, C.bad];
          const newOnes = courses
            .filter((c) => !existingIds.has(c.id))
            .map((c, i) => ({
              id: c.id, title: c.title, emoji: "📚", period: null,
              students: 0, color: palette[i % palette.length],
              kpis: null, topics: [], chatbot: [], accuracyOverTime: [], reteach: [],
            }));
          return [...prev, ...newOnes];
        });
      })
      .catch(() => {}); // non-fatal — mock courses still show
  }, [user?.id, role]);

  // On student login: check DB for a saved diagnostic result.
  // If found, load saved prefs and jump to home. If not, show the diagnostic test.
  useEffect(() => {
    if (!user || role !== "student") {
      setDiagChecked(false);
      setSView(null);
      return;
    }
    fetch(`/api/diagnostic/result?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then(({ result }) => {
        if (result) {
          const next = { visual: 5, audio: 5, text: 5 };
          if (result.scores) {
            for (const f of ["visual", "audio", "text"]) {
              const pct = result.scores[f]?.pct;
              if (typeof pct === "number") next[f] = Math.max(1, Math.round(pct / 10));
            }
          }
          next[result.assigned_format] = 10;
          setPrefs(next);
          setMode(result.assigned_format);
          setSView("home");
        } else {
          setSView("assessment");
        }
      })
      .catch(() => setSView("assessment")) // network error → show diagnostic
      .finally(() => setDiagChecked(true));
  }, [user?.id, role]);

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
    // Apply IEP weight boosts on top of diagnostic scores
    for (const flag of accommodationFlags) {
      const rule = ACCOMMODATION_RULES[flag];
      if (rule?.weightBoost) {
        for (const [m, boost] of Object.entries(rule.weightBoost)) {
          next[m] = Math.min(10, (next[m] ?? 5) + boost);
        }
      }
    }
    setPrefs(next);
    setMode(assignedFormat);
    setSView("home");

    // Persist result so the diagnostic is skipped on next login
    if (user?.id) {
      fetch("/api/diagnostic/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, assignedFormat, scores: scores ?? null }),
      }).catch(console.error);
    }
  };

  let body;

  // While Supabase checks for an existing session, show nothing to avoid flicker
  if (loading) {
    body = <div style={{ minHeight: "100vh", background: C.paper }} />;
  } else if (!role) {
    // No role chosen yet — show the landing page
    body = <Landing onPick={(r) => setPendingRole(r)} />;
  } else if (!user) {
    // Role chosen but not logged in — show the auth page
    body = <Auth role={role} onBack={() => setPendingRole(null)} />;
  } else if (role === "student" && !diagChecked) {
    // Checking DB for existing diagnostic — show blank to avoid flicker
    body = <div style={{ minHeight: "100vh", background: C.paper }} />;
  } else if (role === "student") {
    const openCourse = (c) => { setCourse(c); setSView("courseDetail"); };
    const openTopic = (t) => { setActiveTopic(t); setMode(pickMode(prefs, mode)); setSView("quiz"); };
    const topBarRight = sView !== "assessment" && (
      <Button variant="ghost" onClick={() => setSView("home")} style={{ color: C.brand }}>My courses</Button>
    );
    body = (
      <>
        <TopBar role="student" onLogout={logout} right={topBarRight} />
        {sView === "assessment"   && <Assessment studentId={user?.id ?? 1} accommodationFlags={accommodationFlags} onDone={finishAssessment} />}
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
    const topBarRight = (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {tView !== "catalog" && tView !== "iep" && (
          <Button variant="ghost" onClick={() => setTView("catalog")} style={{ color: C.brand }}>My courses</Button>
        )}
        {tView === "student" && (
          <Button variant="ghost" onClick={() => setTView("dashboard")} style={{ color: C.brand }}>Dashboard</Button>
        )}
        <Button
          variant={tView === "iep" ? "soft" : "ghost"}
          onClick={() => setTView("iep")}
          style={{ color: tView === "iep" ? C.brand : C.sub }}>
          Students &amp; IEPs
        </Button>
      </div>
    );
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
        {tView === "student" && (
          <StudentDetail
            student={activeStudent}
            onBack={() => setTView("dashboard")}
            onIepLoad={(flags) => handleIepLoad(activeStudent?.id, flags)}
          />
        )}
        {tView === "iep" && (
          <IepRoster
            onStudent={(s) => { setActiveStudent(s); setTView("student"); }}
            onIepLoad={handleIepLoad}
            onBack={() => setTView("catalog")}
          />
        )}
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
