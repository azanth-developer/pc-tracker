import { useActivityData } from "../hooks/useActivityData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DemoBanner from "../components/DemoBanner";
import { FileText, Download } from "lucide-react";

function formatSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Reports() {
  const { appUsage, dailyData, isDemo, connected } = useActivityData();

  const weeklyTotal = dailyData.reduce((a, d) => a + d.active, 0).toFixed(1);
  const weeklyIdle  = dailyData.reduce((a, d) => a + d.idle,   0).toFixed(1);

  function exportCSV() {
    const rows = [
      ["Application", "Active Time", "Duration"],
      ...appUsage.map(a => [a.appName, a.activeTime, formatSeconds(a.activeTime)]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `pc-tracker-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-content">
      <DemoBanner connected={connected} />

      <div className="page-header-row">
        <div>
          <h2 className="page-title">Activity Reports</h2>
          <p className="page-desc">Detailed analytics and exportable logs</p>
        </div>
        <button id="btn-export-csv" className="btn-primary" onClick={exportCSV}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Weekly Summary */}
      <div className="report-summary-cards">
        <div className="rscard rscard-blue">
          <FileText size={18} />
          <div>
            <p className="rscard-label">Total Active Hours (Week)</p>
            <p className="rscard-value">{weeklyTotal}h</p>
          </div>
        </div>
        <div className="rscard rscard-orange">
          <FileText size={18} />
          <div>
            <p className="rscard-label">Total Idle Hours (Week)</p>
            <p className="rscard-value">{weeklyIdle}h</p>
          </div>
        </div>
        <div className="rscard rscard-green">
          <FileText size={18} />
          <div>
            <p className="rscard-label">Productivity Rate</p>
            <p className="rscard-value">
              {((weeklyTotal / (parseFloat(weeklyTotal) + parseFloat(weeklyIdle))) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Chart */}
      <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
        <h3 className="chart-title">Daily Active vs Idle Hours</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dailyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} unit="h" />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Legend />
            <Bar dataKey="active" name="Active" fill="#6366f1" radius={[4,4,0,0]} />
            <Bar dataKey="idle"   name="Idle"   fill="#f59e0b" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* App usage table */}
      <div className="chart-card">
        <h3 className="chart-title">Application Usage Breakdown</h3>
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Application</th>
                <th>Active Time</th>
                <th>Share</th>
                <th>Bar</th>
              </tr>
            </thead>
            <tbody>
              {appUsage.map((app, i) => {
                const maxTime = appUsage[0]?.activeTime || 1;
                const pct = ((app.activeTime / maxTime) * 100).toFixed(0);
                return (
                  <tr key={app.appName}>
                    <td className="td-num">{i + 1}</td>
                    <td className="td-app">{app.appName}</td>
                    <td className="td-time">{formatSeconds(app.activeTime)}</td>
                    <td className="td-pct">{pct}%</td>
                    <td className="td-bar">
                      <div className="bar-bg">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
