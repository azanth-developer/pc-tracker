import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

export default function ProductivityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="gradIdle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} unit="h" />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Legend />
        <Area
          type="monotone" dataKey="active" name="Active Hours"
          stroke="#6366f1" strokeWidth={2}
          fill="url(#gradActive)"
        />
        <Area
          type="monotone" dataKey="idle" name="Idle Hours"
          stroke="#f59e0b" strokeWidth={2}
          fill="url(#gradIdle)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
