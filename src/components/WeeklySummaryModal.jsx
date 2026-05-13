import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, Zap, PieChart, Activity, CheckCircle, AlertCircle, Coffee, Keyboard, Mouse, AppWindow, TrendingUp } from "lucide-react";

export default function WeeklySummaryModal({ user, onClose }) {
  if (!user) return null;

  // Mock data for breakdown (In real app, this would come from a Firestore collection 'weeklySummaries')
  const days = [
    { day: "Monday", login: "09:05 AM", logout: "06:12 PM", active: "8h 12m", idle: "42m", prod: 88 },
    { day: "Tuesday", login: "08:58 AM", logout: "05:45 PM", active: "7h 55m", idle: "35m", prod: 82 },
    { day: "Wednesday", login: "09:12 AM", logout: "06:30 PM", active: "8h 40m", idle: "55m", prod: 91 },
    { day: "Thursday", login: "09:02 AM", logout: "01:30 PM", active: "4h 15m", idle: "12m", prod: 76 },
    { day: "Friday", login: "---", logout: "---", active: "0h", idle: "0s", prod: 0 },
  ];

  const prodScore = user.productivityScore || 78;
  const getStatusColor = (val) => {
    if (val >= 90) return "var(--green)";
    if (val >= 75) return "var(--blue)";
    return "var(--orange)";
  };

  const getStatusLabel = (val) => {
    if (val >= 90) return "Excellent";
    if (val >= 75) return "Good";
    if (val >= 50) return "Average";
    return "Poor";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content summary-modal-v2"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-v2">
          <div className="user-profile-header">
            <div className="profile-avatar-large">{user.displayName?.[0]}</div>
            <div className="profile-meta">
              <h2>Weekly Employee Summary</h2>
              <div className="meta-pills">
                <span className="pill-name">{user.displayName}</span>
                <span className="pill-id">{user.employeeId || "EMP-9821"}</span>
                <span className="pill-dept">Development</span>
              </div>
            </div>
          </div>
          <button className="close-v2" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body-v2">
          {/* Section 1: Daily Logs */}
          <div className="summary-section">
            <h3 className="section-title"><Calendar size={16} /> Daily Performance Logs</h3>
            <div className="daily-table-wrap">
              <table className="daily-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Login</th>
                    <th>Logout</th>
                    <th>Active Time</th>
                    <th>Idle Time</th>
                    <th>Prod %</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d, i) => (
                    <tr key={i} className={d.active === "0h" ? "day-absent" : ""}>
                      <td className="font-bold">{d.day}</td>
                      <td>{d.login}</td>
                      <td>{d.logout}</td>
                      <td className="text-blue">{d.active}</td>
                      <td className="text-orange">{d.idle}</td>
                      <td>
                        <span className="prod-badge" style={{ background: `${getStatusColor(d.prod)}15`, color: getStatusColor(d.prod) }}>
                          {d.prod}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Total Weekly Analysis */}
          <div className="summary-section">
            <h3 className="section-title"><TrendingUp size={16} /> Total Weekly Analysis</h3>
            <div className="weekly-stats-grid">
              <div className="stat-v2-card">
                <Clock size={18} className="icon-blue" />
                <div className="stat-v2-info">
                  <span>Total Worked Hours</span>
                  <strong>{user.weeklySummary?.lastWeekHours || "29.2"} Hours</strong>
                </div>
              </div>
              <div className="stat-v2-card">
                <CheckCircle size={18} className="icon-green" />
                <div className="stat-v2-info">
                  <span>Attendance Rate</span>
                  <strong>85%</strong>
                </div>
              </div>
              <div className="stat-v2-card">
                <Zap size={18} className="icon-purple" />
                <div className="stat-v2-info">
                  <span>Avg Productivity</span>
                  <strong>{prodScore}%</strong>
                </div>
              </div>
              <div className="stat-v2-card">
                <Coffee size={18} className="icon-orange" />
                <div className="stat-v2-info">
                  <span>Total Idle Time</span>
                  <strong>2h 24m</strong>
                </div>
              </div>
              <div className="stat-v2-card">
                <Keyboard size={18} className="icon-cyan" />
                <div className="stat-v2-info">
                  <span>Keyboard Activity</span>
                  <strong>{(user.keystrokes * 4.2).toLocaleString()} Hits</strong>
                </div>
              </div>
              <div className="stat-v2-card">
                <Mouse size={18} className="icon-pink" />
                <div className="stat-v2-info">
                  <span>Mouse Activity</span>
                  <strong>{(user.mouseClicks * 3.8).toLocaleString()} Clicks</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Performance Status */}
          <div className="performance-footer">
            <div className="status-indicator-wrap">
              <span className="status-label">FINAL PERFORMANCE STATUS:</span>
              <span className="status-badge-large" style={{ background: getStatusColor(prodScore), boxShadow: `0 0 20px ${getStatusColor(prodScore)}40` }}>
                {getStatusLabel(prodScore)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1.5rem; }
        .summary-modal-v2 { width: 100%; max-width: 900px; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; display: flex; flex-direction: column; max-height: 95vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .modal-header-v2 { padding: 2rem; background: linear-gradient(90deg, rgba(30,41,59,0.5) 0%, transparent 100%); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: flex-start; }
        .user-profile-header { display: flex; gap: 1.5rem; align-items: center; }
        .profile-avatar-large { width: 64px; height: 64px; border-radius: 18px; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; color: #fff; border: 2px solid rgba(255,255,255,0.1); }
        .profile-meta h2 { font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .meta-pills { display: flex; gap: 0.75rem; }
        .meta-pills span { padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
        .pill-name { background: rgba(99,102,241,0.1); color: #818cf8; }
        .pill-id { background: rgba(255,255,255,0.05); color: #94a3b8; }
        .pill-dept { background: rgba(34,211,238,0.1); color: #22d3ee; }
        .close-v2 { background: rgba(255,255,255,0.05); border: none; color: #94a3b8; padding: 0.5rem; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .close-v2:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
        
        .modal-body-v2 { padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 2rem; }
        .section-title { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .daily-table-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; }
        .daily-table { width: 100%; border-collapse: collapse; text-align: left; }
        .daily-table th { padding: 1rem; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .daily-table td { padding: 1rem; font-size: 0.875rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .day-absent td { opacity: 0.4; }
        .prod-badge { padding: 0.25rem 0.5rem; border-radius: 6px; font-weight: 700; font-size: 0.75rem; }
        
        .weekly-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .stat-v2-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 16px; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; }
        .stat-v2-card:hover { transform: translateY(-2px); border-color: rgba(99,102,241,0.3); }
        .stat-v2-info span { display: block; font-size: 0.7rem; color: #64748b; margin-bottom: 0.25rem; }
        .stat-v2-info strong { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
        
        .performance-footer { margin-top: 1rem; padding: 1.5rem; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: center; }
        .status-indicator-wrap { display: flex; align-items: center; gap: 1.5rem; }
        .status-label { font-size: 0.875rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; }
        .status-badge-large { padding: 0.75rem 2rem; border-radius: 12px; color: #fff; font-weight: 800; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .icon-blue { color: #6366f1; } .icon-green { color: #22c55e; } .icon-purple { color: #a855f7; }
        .icon-orange { color: #f59e0b; } .icon-cyan { color: #06b6d4; } .icon-pink { color: #ec4899; }
        .text-blue { color: #818cf8; font-weight: 600; }
        .text-orange { color: #fb923c; font-weight: 600; }
        .font-bold { font-weight: 700; color: #f1f5f9; }
      `}</style>
    </div>
  );
}
