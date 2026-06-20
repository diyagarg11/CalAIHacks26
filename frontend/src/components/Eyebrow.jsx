import { C, MONO } from "../constants/tokens";

export function Eyebrow({ children, color = C.faint }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
      color, fontWeight: 700 }}>{children}</div>
  );
}
