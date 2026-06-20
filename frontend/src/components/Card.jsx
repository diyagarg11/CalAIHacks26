import { C } from "../constants/tokens";

export function Card({ children, style, ...p }) {
  return (
    <div {...p} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, ...style }}>
      {children}
    </div>
  );
}
