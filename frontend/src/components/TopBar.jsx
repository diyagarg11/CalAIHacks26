import { LogOut, ShieldCheck } from "lucide-react";
import { C, DISPLAY, MONO, FONT } from "../constants/tokens";
import { Button } from "./Button";
import { TriMark } from "./TriMark";

export function TopBar({ role, onLogout, onMfaSetup, right }) {
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
        {onMfaSetup && (
          <Button variant="ghost" onClick={onMfaSetup}
            style={{ color: C.sub, fontSize: 13, fontFamily: FONT }}>
            <ShieldCheck size={15} /> 2FA
          </Button>
        )}
        <Button variant="ghost" onClick={onLogout}><LogOut size={15} /> Sign out</Button>
      </div>
    </div>
  );
}
