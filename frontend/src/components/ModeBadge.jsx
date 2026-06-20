import { MODES } from "../constants/tokens";

export function ModeBadge({ mode, size = 13 }) {
  const m = MODES[mode];
  const I = m.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: m.soft,
      color: m.color, padding: "4px 10px", borderRadius: 999, fontSize: size, fontWeight: 600 }}>
      <I size={size + 1} /> {m.label}
    </span>
  );
}
