import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

export default function SystemGauges({ liveSystem, history }) {
  return (
    <div className="sys-mini-wrap">
      <div className="sys-mini-row">
        <div className="sys-mini-stat">
          <span className="sys-mini-label">CPU</span>
          <span className="sys-mini-value cpu">{Math.round(liveSystem.cpu)}%</span>
        </div>
        <div className="sys-mini-stat">
          <span className="sys-mini-label">RAM</span>
          <span className="sys-mini-value ram">{liveSystem.ram.toFixed(1)} GB</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={history.slice(-10)}>
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "none", borderRadius: 6, fontSize: 11 }}
          />
          <Line type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2} dot={false} name="CPU %" />
          <Line type="monotone" dataKey="ram" stroke="#22d3ee" strokeWidth={2} dot={false} name="RAM %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
