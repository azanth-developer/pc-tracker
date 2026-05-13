import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, Zap, PieChart, Activity, CheckCircle, AlertCircle, Coffee, Keyboard, Mouse, AppWindow, TrendingUp, User, Monitor, LayoutDashboard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";

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
    { name: "VS Code", value: 45, color: "#6366f1" },
    { name: "Chrome", value: 30, color: "#22d3ee" },
    { name: "Slack", value: 15, color: "#a855f7" },
    { name: "Other", value: 10, color: "#94a3b8" },
  ];

  const attendanceLog = [
    { day: "Mon", login: "09:00 AM", logout: "05:12 PM", hours: "8h 12m", status: "Present" },
    { day: "Tue", login: "08:58 AM", logout: "05:45 PM", hours: "7h 55m", status: "Present" },
    { day: "Wed", login: "09:12 AM", logout: "06:30 PM", hours: "8h 40m", status: "Present" },
    { day: "Thu", login: "09:02 AM", logout: "01:30 PM", hours: "4h 15m", status: "Half Day" },
  ];

  const prodScore = user.productivityScore || 78;
  const getStatusColor = (val) => {
    if (val >= 90) return "#22c55e";
    if (val >= 75) return "#6366f1";
    if (val >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusLabel = (val) => {
    if (val >= 90) return "Excellent";
    if (val >= 75) return "Good";
    if (val >= 50) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <motion.div 
        className="analytics-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div className="drawer-user-info">
            <div className="drawer-avatar">{user.displayName?.[0]}</div>
            <div>
              <h3>Employee Analytics</h3>
              <p>{user.displayName} • {user.employeeId || "EMP-9821"}</p>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="drawer-body">
          {/* Quick Metrics */}
          <div className="drawer-metrics-row">
            <div className="d-metric-card">
              <span className="d-m-label">Productivity</span>
              <span className="d-m-value" style={{ color: getStatusColor(prodScore) }}>{prodScore}%</span>
              <div className="d-m-sub">{getStatusLabel(prodScore)}</div>
            </div>
            <div className="d-metric-card">
              <span className="d-m-label">Active Time</span>
              <span className="d-m-value">{user.activeHours || 0}h</span>
              <div className="d-m-sub">Today</div>
            </div>
            <div className="d-metric-card">
              <span className="d-m-label">Idle Time</span>
              <span className="d-m-value">42m</span>
              <div className="d-m-sub">Today</div>
            </div>
          </div>

          {/* Weekly Hours Chart */}
          <div className="drawer-section">
            <h4 className="drawer-section-title"><Clock size={16} /> Weekly Work Hours</h4>
            <div className="d-chart-wrap">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={weeklyHours}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="drawer-section">
            <h4 className="drawer-section-title"><Calendar size={16} /> Attendance History</h4>
            <div className="d-table-wrap">
              <table className="d-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Login</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLog.map((log, i) => (
                    <tr key={i}>
                      <td>{log.day}</td>
                      <td>{log.login}</td>
                      <td>{log.hours}</td>
                      <td>
                        <span className={`d-status-pill ${log.status.replace(' ', '').toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Input & App Stats */}
          <div className="drawer-stats-grid">
            <div className="d-stat-box">
              <Keyboard size={16} color="#94a3b8" />
              <span>{(user.keystrokes || 0).toLocaleString()} <small>Keys</small></span>
            </div>
            <div className="d-stat-box">
              <Mouse size={16} color="#94a3b8" />
              <span>{(user.mouseClicks || 0).toLocaleString()} <small>Clicks</small></span>
            </div>
          </div>

          <div className="drawer-section">
            <h4 className="drawer-section-title"><AppWindow size={16} /> Most Used Applications</h4>
            <div className="app-usage-list">
              {appUsage.map((app, i) => (
                <div key={i} className="app-usage-item">
                  <div className="app-usage-info">
                    <span className="app-name">{app.name}</span>
                    <span className="app-pct">{app.value}%</span>
                  </div>
                  <div className="app-progress-bg">
                    <div className="app-progress-fill" style={{ width: `${app.value}%`, background: app.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn-full" onClick={onClose}>Close Report</button>
        </div>
      </motion.div>

      <style jsx>{`
        .drawer-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.7); backdrop-filter: blur(4px); z-index: 2000; }
        .analytics-drawer { position: absolute; top: 0; right: 0; height: 100vh; width: 100%; max-width: 440px; background: #0f172a; border-left: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; box-shadow: -20px 0 50px rgba(0,0,0,0.5); }
        .drawer-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; background: rgba(30, 41, 59, 0.5); }
        .drawer-user-info { display: flex; align-items: center; gap: 1rem; }
        .drawer-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 800; color: #fff; }
        .drawer-user-info h3 { font-size: 1rem; color: #fff; margin-bottom: 0.15rem; }
        .drawer-user-info p { font-size: 0.75rem; color: #64748b; }
        .drawer-close { background: none; border: none; color: #64748b; cursor: pointer; transition: color 0.2s; }
        .drawer-close:hover { color: #fff; }
        
        .drawer-body { padding: 1.5rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
        .drawer-metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .d-metric-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 12px; text-align: center; }
        .d-m-label { display: block; font-size: 0.65rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 0.25rem; }
        .d-m-value { display: block; font-size: 1.15rem; font-weight: 800; color: #fff; }
        .d-m-sub { font-size: 0.6rem; color: #475569; margin-top: 0.15rem; }
        
        .drawer-section-title { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; border-left: 3px solid #6366f1; padding-left: 0.75rem; }
        .d-chart-wrap { background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
        
        .d-table-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; }
        .d-table { width: 100%; border-collapse: collapse; text-align: left; }
        .d-table th { padding: 0.75rem; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .d-table td { padding: 0.75rem; font-size: 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .d-status-pill { padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700; }
        .d-status-pill.present { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .d-status-pill.halfday { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
        
        .drawer-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .d-stat-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; color: #fff; font-weight: 700; }
        .d-stat-box small { color: #64748b; font-weight: 600; font-size: 0.75rem; }
        
        .app-usage-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .app-usage-item { display: flex; flex-direction: column; gap: 0.35rem; }
        .app-usage-info { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; }
        .app-name { color: #f1f5f9; }
        .app-pct { color: #64748b; }
        .app-progress-bg { height: 5px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .app-progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
        
        .drawer-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .btn-full { width: 100%; background: #334155; color: #fff; border: none; padding: 0.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .btn-full:hover { background: #475569; }
      `}</style>
    </div>
  );
}
