import { useState } from "react";
import { ChevronLeft, ArrowRight, Lightbulb, Check, X } from "lucide-react";
import { C, FONT, DISPLAY, MONO } from "../../constants/tokens";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Eyebrow } from "../../components/Eyebrow";

export function Quiz({ topic, mode, onDone, onBack }) {
  const questions = topic.questions;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState([]);

  const q = questions[i];
  const answered = picked !== null;
  const correct = answered && picked === q.correct;

  const choose = (idx) => {
    if (answered) return;
    const isCorrect = idx === q.correct;
    setPicked(idx);
    setAttempts((prev) => [...prev, { q: q.q, correct: isCorrect, mode }]);
  };

  const next = () => {
    if (i + 1 < questions.length) {
      setI(i + 1);
      setPicked(null);
      setShowHint(false);
    } else {
      const finalAttempts = [...attempts];
      onDone({
        score: finalAttempts.filter((a) => a.correct).length,
        total: questions.length,
        hintsUsed,
        attempts: finalAttempts,
      });
    }
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "30px 22px" }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 10 }}>
        <ChevronLeft size={16} /> Back to lesson
      </Button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Eyebrow>PRACTICE · {i + 1} OF {questions.length}</Eyebrow>
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
                style={{
                  textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: 12, fontFamily: MONO, fontSize: 15, fontWeight: 700,
                  cursor: answered ? "default" : "pointer", transition: "all .15s",
                  background: isC ? C.visualSoft : isW ? C.badSoft : C.surface,
                  color: isC ? C.good : isW ? C.bad : C.ink,
                  border: `1.5px solid ${isC ? C.good : isW ? C.bad : C.line}`,
                }}>
                {opt}
                {isC && <Check size={18} />}{isW && <X size={18} />}
              </button>
            );
          })}
        </div>

        {!answered && (
          <button onClick={() => { setShowHint(true); if (!showHint) setHintsUsed((h) => h + 1); }}
            style={{
              marginTop: 16, display: "flex", alignItems: "center", gap: 7, border: "none",
              background: "transparent", color: C.audio, fontFamily: FONT, fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>
            <Lightbulb size={16} /> {showHint ? "Hint shown" : "Need a hint?"}
          </button>
        )}
        {showHint && (
          <div style={{
            marginTop: 12, background: C.audioSoft, borderRadius: 10, padding: "12px 14px",
            fontFamily: FONT, fontSize: 14, color: C.ink, display: "flex", gap: 9,
          }}>
            <Lightbulb size={16} color={C.audio} style={{ flexShrink: 0, marginTop: 2 }} /> {q.hint}
          </div>
        )}

        {answered && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: correct ? C.good : C.bad }}>
              {correct ? "Nice — that's right." : "Not quite — review the hint and keep going."}
            </span>
            <Button onClick={next} color={correct ? C.good : C.brand}>
              {i + 1 < questions.length ? "Next question" : "See results"} <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
