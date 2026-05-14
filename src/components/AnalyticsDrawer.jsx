import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Clock, Calendar, Zap, Activity, 
  Keyboard, Mouse, AppWindow, TrendingUp, 
  User, Target, BarChart3, LineChart
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from "recharts";

export default function AnalyticsDrawer({ user, onClose }) {
  if (!user) return null;

  // Mock data for weekly charts
  const weeklyHours = [
    { name: "Mon", hours: 8.2 },
    { name: "Tue", hours: 7.9 },
    { name: "Wed", hours: 8.6 },
    { name: "Thu", hours: 4.5 },
    { name: "Fri", hours: 0 },
    { name: "Sat", hours: 0 },
    { name: "Sun", hours: 0 },
  ];

  const appUsage = [
    { name: "VS Code", value: 45, color: "var(--blue)" },
    { name: "Chrome", value: 30, color: "var(--success)" },
    { name: "Slack", value: 15, color: "#a855f7" },
    { name: "Terminal", value: 10, color: "var(--text3)" },
  ];

  const attendanceLog = [
    { day: "Mon", login: "09:00 AM", hours: "8.2h", status: "Present" },
    { day: "Tue", login: "08:58 AM", hours: "7.9h", status: "Present" },
    { day: "Wed", login: "09:12 AM", hours: "8.6h", status: "Present" },
    { day: "Thu", login: "09:02 AM", hours: "4.2h", status: "Half Day" },
  ];

  const prodScore = user.productivityScore || 78;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: "flex-end", padding: 0 }}>
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "100vh",
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ background: "var(--bg2)", padding: "2rem", borderBottom: "1px solid var(--border)", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.05)", border: "none", color: "var(--text3)", borderRadius: "10px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} />
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div className="avatar-ring" style={{ width: "56px", height: "56px" }}>
              <div className="avatar-img" style={{ width: "50px", height: "50px", fontSize: "1.2rem" }}>
                {(user.employeeName || user.email || "U")[0].toUpperCase()}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Personnel Analytics</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text3)", fontWeight: 600 }}>{user.employeeName} • {user.employeeId || "NXS-NODE"}</p>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* Top Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div className="stat-card" style={{ padding: "1.25rem", textAlign: "center" }}>
              <p className="stat-label" style={{ fontSize: "0.6rem" }}>Efficiency</p>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--blue)" }}>{prodScore}%</h3>
            </div>
            <div className="stat-card" style={{ padding: "1.25rem", textAlign: "center" }}>
              <p className="stat-label" style={{ fontSize: "0.6rem" }}>Active Time</p>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff" }}>{user.activeHours || 0}h</h3>
            </div>
            <div className="stat-card" style={{ padding: "1.25rem", textAlign: "center" }}>
              <p className="stat-label" style={{ fontSize: "0.6rem" }}>Connectivity</p>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--success)" }}>98%</h3>
            </div>
          </div>

          {/* Engagement Projection Chart */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <LineChart size={18} className="text-blue" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Engagement Trend</h4>
            </div>
            <div className="chart-card" style={{ padding: "1.25rem", height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyHours}>
                  <defs>
                    <linearGradient id="drawerColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: 'var(--blue)' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="var(--blue)" strokeWidth={3} fillOpacity={1} fill="url(#drawerColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temporal Logs Table */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Calendar size={18} className="text-blue" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Temporal Persistence Logs</h4>
            </div>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr style={{ fontSize: "0.65rem" }}>
                    <th>Scope</th>
                    <th>Entry</th>
                    <th>Duration</th>
                    <th>Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLog.map((log, i) => (
                    <tr key={i} style={{ fontSize: "0.8rem" }}>
                      <td><span style={{ fontWeight: 800 }}>{log.day}</span></td>
                      <td>{log.login}</td>
                      <td style={{ color: "var(--blue)", fontWeight: 700 }}>{log.hours}</td>
                      <td>
                        <span style={{ 
                          fontSize: "0.65rem", 
                          fontWeight: 800, 
                          color: log.status === "Present" ? "var(--success)" : "var(--warning)",
                          background: log.status === "Present" ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px"
                        }}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Toolchain Allocation */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <BarChart3 size={18} className="text-blue" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Standard Toolchain Allocation</h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {appUsage.map((app, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text2)" }}>{app.name}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>{app.value}%</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.03)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${app.value}%`, height: "100%", background: app.color, borderRadius: "3px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "2rem", background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
          <button className="btn-primary" onClick={onClose} style={{ width: "100%", height: "54px", justifyContent: "center" }}>
            Commit Personnel Review
          </button>
        </div>
      </motion.div>
    </div>
  );
}
