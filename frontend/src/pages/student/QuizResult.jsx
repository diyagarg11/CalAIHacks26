import { Award, RotateCcw } from "lucide-react";
import { C, FONT, DISPLAY, MONO } from "../../constants/tokens";
import { Button } from "../../components/Button";

export function QuizResult({ result, onAgain, onHome }) {
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
