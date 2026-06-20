import { LogOut } from "lucide-react";
import { C, DISPLAY, MONO } from "../constants/tokens";
import { Button } from "./Button";
import { TriMark } from "./TriMark";

export function TopBar({ role, onLogout, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 22px", borderBottom: `1px solid ${C.line}`, background: C.surface, position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <TriMark s={28} />
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, color: C.ink }}>Triad</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.faint, border: `1px solid ${C.line}`,
          padding: "2px 7px", borderRadius: 6, letterSpacing: 1, textTransform: "uppercase" }}>{role}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {right}
        <Button variant="ghost" onClick={onLogout}><LogOut size={15} /> Sign out</Button>
      </div>
    </div>
  );
}
