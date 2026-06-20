import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { C, FONT, DISPLAY, MONO, STATUS } from "../../constants/tokens";
import { STUDENTS } from "../../constants/data";
import { Card } from "../../components/Card";
import { Avatar } from "../../components/Avatar";
import { ModeBadge } from "../../components/ModeBadge";

export function StudentTable({ onStudent }) {
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
