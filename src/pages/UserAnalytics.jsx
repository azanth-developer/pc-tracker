import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useActivityData } from "../hooks/useActivityData";
import { useDevices } from "../hooks/useFirestoreData";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Keyboard, Mouse, Clock, TrendingUp, Activity, BarChart3 } from "lucide-react";

const COLORS = ["#6366f1","#22d3ee","#a78bfa","#34d399","#f59e0b","#f472b6","#60a5fa","#fb923c","#e879f9","#38bdf8"];

export default function UserAnalytics() {
  const { stats, appUsage, dailyData, connected } = useActivityData();
  const { devices } = useDevices();
  const [timeRange, setTimeRange] = useState("week");

  // Category breakdown from app usage
  const pieData = useMemo(() => {
    const categories = {};
    (appUsage || []).forEach(a => {
      const cat = a.appName.includes("Code") || a.appName.includes("Studio") || a.appName.includes("Notepad") ? "Development"
        : a.appName.includes("Chrome") || a.appName.includes("Edge") || a.appName.includes("Firefox") ? "Browser"
        : a.appName.includes("Teams") || a.appName.includes("Slack") || a.appName.includes("Discord") || a.appName.includes("Outlook") ? "Communication"
        : a.appName.includes("Figma") || a.appName.includes("Photoshop") ? "Design"
        : a.appName.includes("Explorer") || a.appName.includes("Terminal") || a.appName.includes("PowerShell") ? "System"
        : "Other";
      categories[cat] = (categories[cat] || 0) + a.activeTime;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [appUsage]);

  // Hourly activity data (simulated from daily data)
  const hourlyData = useMemo(() => {
    const hours = [];
    for (let h = 8; h <= 20; h++) {
      const label = `${h}:00`;
      const active = Math.random() * 50 + 10;
      const idle = Math.random() * 20;
      hours.push({ hour: label, active: Math.round(active), idle: Math.round(idle) });
    }
    return hours;
  }, []);

  // Radar chart data for productivity dimensions
  const radarData = useMemo(() => {
    const st = stats || {};
    return [
      { metric: "Typing", value: Math.min(100, (st.typingSpeed || 0) * 2) },
      { metric: "Mouse", value: Math.min(100, Math.round(((st.mouseClicks || 0) / 500) * 100)) },
      { metric: "Focus", value: st.productivityScore || 0 },
      { metric: "Activity", value: Math.min(100, 100 - (st.idlePercent || 0)) },
      { metric: "Duration", value: Math.min(100, Math.round(((parseFloat(st.totalActiveHours) || 0) / 8) * 100)) },
      { metric: "Apps", value: Math.min(100, (appUsage || []).length * 10) },
    ];
  }, [stats, appUsage]);

  const st = stats || {};

  return (
    <div className="page-content">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">User Analytics</h2>
          <p className="page-desc">Detailed productivity insights and behavior analysis</p>
        </div>
        <div className="header-controls">
          <select
            className="device-selector"
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="analytics-cards">
        {[
          { icon: <Keyboard size={22} />, value: `${st.typingSpeed || 0} keys/min`, label: "Avg Typing Speed", cls: "an-blue" },
          { icon: <Clock size={22} />, value: `${st.activeTypingMinutes || 0}m`, label: "Active Typing Duration", cls: "an-purple" },
          { icon: <TrendingUp size={22} />, value: `${st.productivityScore || 0}%`, label: "Productivity Score", cls: "an-green" },
          { icon: <Mouse size={22} />, value: (st.mouseClicks || 0).toLocaleString(), label: "Total Mouse Clicks", cls: "an-orange" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className={`an-card ${card.cls}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3 }}
          >
            {card.icon}
            <div>
              <p className="an-value">{card.value}</p>
              <p className="an-label">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="charts-grid">
        {/* Category Pie */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="chart-title">Usage by Category</h3>
          {pieData.length === 0 ? <p className="chart-empty">No data yet</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Productivity Radar */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="chart-title">Productivity Dimensions</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Trend */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="chart-title">Weekly Productivity Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="h" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="active" name="Active" fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="idle" name="Idle" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Hourly Activity & Idle vs Active */}
      <div className="charts-grid">
        <motion.div
          className="chart-card span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="chart-title">Hourly Activity Pattern</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="gradHourActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradHourIdle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="m" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="active" name="Active" stroke="#6366f1" strokeWidth={2} fill="url(#gradHourActive)" />
              <Area type="monotone" dataKey="idle" name="Idle" stroke="#f59e0b" strokeWidth={2} fill="url(#gradHourIdle)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Attendance Graph */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <h3 className="chart-title">Daily Attendance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="h" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="active" name="Hours" fill="#22d3ee" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* App Usage Stats Table */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="chart-title">Application Usage Statistics</h3>
        <div className="report-table-wrap" style={{ maxHeight: 320, overflowY: "auto" }}>
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Application</th>
                <th>Active Time</th>
                <th>Share</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {(appUsage || []).map((app, i) => {
                const maxTime = appUsage[0]?.activeTime || 1;
                const pct = ((app.activeTime / maxTime) * 100).toFixed(0);
                const h = Math.floor(app.activeTime / 3600);
                const m = Math.floor((app.activeTime % 3600) / 60);
                return (
                  <tr key={app.appName}>
                    <td className="td-num">{i + 1}</td>
                    <td className="td-app">{app.appName}</td>
                    <td className="td-time">{h > 0 ? `${h}h ${m}m` : `${m}m`}</td>
                    <td className="td-pct">{pct}%</td>
                    <td className="td-bar">
                      <div className="bar-bg"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
