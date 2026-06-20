import { useRef } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { C, DISPLAY, FONT, MONO } from "../../constants/tokens";

export function CourseCarousel({ courses, selected, onSelect }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", marginTop: 20 }}>
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        style={{
          position: "absolute", left: -18, top: "50%", transform: "translateY(-50%)",
          zIndex: 2, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.line}`,
          background: C.surface, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 2px 8px rgba(26,27,46,.08)",
        }}
      >
        <ChevronLeft size={17} color={C.sub} />
      </button>

      <div
        ref={scrollRef}
        style={{
          display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none",
          padding: "4px 4px 8px", marginLeft: 4, marginRight: 4,
        }}
      >
        {courses.map((c) => {
          const active = selected.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              style={{
                flexShrink: 0, width: 220, textAlign: "left", border: "none", cursor: "pointer",
                background: active ? c.color + "12" : C.surface,
                borderRadius: 16, padding: "18px 18px 16px",
                outline: active ? `2px solid ${c.color}` : `1px solid ${C.line}`,
                outlineOffset: active ? 0 : -1,
                transition: "all .15s",
                boxShadow: active ? `0 4px 18px ${c.color}28` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{c.emoji}</span>
                {active && (
                  <span style={{
                    fontFamily: MONO, fontSize: 10, letterSpacing: 1, fontWeight: 700,
                    color: c.color, background: c.color + "18", padding: "3px 8px", borderRadius: 6,
                  }}>
                    ACTIVE
                  </span>
                )}
              </div>

              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 3 }}>
                {c.title}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12.5, color: C.faint, marginBottom: 12 }}>
                {c.period}
              </div>

              <div style={{ height: 5, borderRadius: 999, background: C.line, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ width: `${c.kpis.mastery}%`, height: "100%", background: c.color, borderRadius: 999 }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: active ? c.color : C.ink }}>
                  {c.kpis.mastery}%
                </span>
                <span style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontFamily: FONT, fontSize: 12, color: C.faint,
                }}>
                  <Users size={12} /> {c.students}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        style={{
          position: "absolute", right: -18, top: "50%", transform: "translateY(-50%)",
          zIndex: 2, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.line}`,
          background: C.surface, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 2px 8px rgba(26,27,46,.08)",
        }}
      >
        <ChevronRight size={17} color={C.sub} />
      </button>
    </div>
  );
}
