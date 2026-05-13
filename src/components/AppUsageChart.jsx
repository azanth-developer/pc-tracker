import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1","#22d3ee","#a78bfa","#34d399","#f59e0b","#f472b6","#60a5fa","#fb923c"];

function formatSecs(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="ct-app">{d.appName}</p>
      <p className="ct-time">{formatSecs(d.activeTime)}</p>
    </div>
  );
}

export default function AppUsageChart({ data }) {
  if (!data?.length) return <p className="chart-empty">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={v => formatSecs(v)}
          stroke="#94a3b8"
          tick={{ fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="appName"
          width={130}
          stroke="#94a3b8"
          tick={{ fontSize: 11 }}
          tickFormatter={v => v.length > 18 ? v.slice(0, 18) + "…" : v}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="activeTime" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
