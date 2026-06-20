import { C, DISPLAY } from "../constants/tokens";

export function Avatar({ name, size = 38 }) {
  const initials = name.split(" ").map((n) => n[0]).join("");
  const colors = [C.brand, C.visual, C.audio, C.bad];
  const c = colors[name.length % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: c + "22", color: c,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      fontFamily: DISPLAY, fontWeight: 700, fontSize: size * 0.38 }}>{initials}</div>
  );
}
