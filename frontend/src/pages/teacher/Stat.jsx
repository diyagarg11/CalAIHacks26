import { TrendingUp, TrendingDown } from "lucide-react";
import { C, FONT, MONO } from "../../constants/tokens";
import { Card } from "../../components/Card";

export function Stat({ label, value, sub, Icon, color, trend }) {
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "1A",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={19} color={color} />
        </div>
        {trend != null && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: MONO, fontSize: 12,
            fontWeight: 700, color: trend >= 0 ? C.good : C.bad }}>
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.ink, marginTop: 12 }}>{value}</div>
      <div style={{ fontFamily: FONT, fontSize: 13, color: C.sub }}>{label}</div>
      {sub && <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint, marginTop: 2 }}>{sub}</div>}
    </Card>
  );
}
