import { C, FONT } from "../constants/tokens";

export function Button({ children, onClick, variant = "solid", color = C.brand, style, type, ...p }) {
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
