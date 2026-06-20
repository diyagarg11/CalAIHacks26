import { C } from "../constants/tokens";

export function TriMark({ s = 34 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="13" r="9.5" fill={C.text} opacity="0.92" />
      <circle cx="13" cy="26" r="9.5" fill={C.audio} opacity="0.92" />
      <circle cx="27" cy="26" r="9.5" fill={C.visual} opacity="0.92" />
    </svg>
  );
}
