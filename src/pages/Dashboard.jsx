import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConsolidatedData } from "../hooks/useConsolidatedData";
import { UserAvatar } from "../components/ProfessionalComponents";
import { Users, UserCheck, UserMinus, Laptop, Search, Filter } from "lucide-react";
import AnalyticsDrawer from "../components/AnalyticsDrawer";

export default function Dashboard() {
  const { employees, employeeDevices, aggregated, loading } = useConsolidatedData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const onlineDevices = employeeDevices.filter(d => d.isOnline).length;

  const filteredUsers = useMemo(() => {
    return employees.filter(u => 
      (u.employeeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => (b.productivityScore || 0) - (a.productivityScore || 0));
  }, [employees, searchQuery]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-desc" style={{ color: "var(--text-light)", fontWeight: 500 }}>Overview of your team's daily status.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "0.75rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={20} />
            </div>
            <div>
              <p className="stat-label">Total Employees</p>
              <h3 className="stat-value">{aggregated.totalUsers}</h3>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "var(--success-bg)", color: "var(--success)", padding: "0.75rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }} className={aggregated.onlineUsers > 0 ? "animate-pulse" : ""}>
              <UserCheck size={20} />
            </div>
            <div>
              <p className="stat-label">Present Today</p>
              <h3 className="stat-value">
                <motion.span key={aggregated.onlineUsers} initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  {aggregated.onlineUsers}
                </motion.span>
              </h3>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "var(--danger-bg)", color: "var(--danger)", padding: "0.75rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserMinus size={20} />
            </div>
            <div>
              <p className="stat-label">Absent</p>
              <h3 className="stat-value">{aggregated.offlineUsers}</h3>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "#f3e8ff", color: "#9333ea", padding: "0.75rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }} className={onlineDevices > 0 ? "animate-pulse" : ""}>
              <Laptop size={20} />
            </div>
            <div>
              <p className="stat-label">Devices Online</p>
              <h3 className="stat-value">
                <motion.span key={onlineDevices} initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  {onlineDevices}
                </motion.span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", background: "var(--bg-card)" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>Employee Performance</h3>
            <p className="page-desc">Review team productivity metrics.</p>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", flex: 1, maxWidth: "320px" }}>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search employees..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="header-icon-btn">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Productivity Score</th>
              <th>Status</th>
              <th>Mouse</th>
              <th>Keyboard</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice(0, 10).map((user) => {
              const device = employeeDevices.find(d => d.uid === user.uid);
              const isOnline = device?.isOnline;
              const score = user.productivityScore || 82;
              
              return (
                <tr className="tr-hover" key={user.uid} style={{ cursor: "pointer" }} onClick={() => setSelectedUser(user)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <UserAvatar user={user} size={36} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "2px" }}>{user.employeeName || user.displayName || user.name || user.email?.split('@')[0] || "Unknown User"}</p>
                        <p className="truncate" style={{ fontSize: "0.75rem", color: "var(--text-light)", fontWeight: 500, marginBottom: "2px" }}>{user.position || "Operations Manager"}</p>
                        <p className="truncate" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: "200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", width: "32px" }}>{score}%</span>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ 
                          width: `${score}%`, 
                          background: score >= 80 ? "linear-gradient(to right, #10b981, #3b82f6)" : score >= 50 ? "linear-gradient(to right, #f59e0b, #ef4444)" : "linear-gradient(to right, #ef4444, #7f1d1d)",
                          boxShadow: score >= 80 ? "0 0 10px rgba(59,130,246,0.4)" : "none"
                        }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-pill ${isOnline ? 'badge-online' : 'badge-offline'}`}>
                      <span className={`status-dot ${isOnline ? 'live' : 'offline'}`} />
                      {isOnline ? "Live" : "Offline"}
                    </span>
                  </td>
                  <td>
                    <span className="badge-pill badge-offline" style={{ padding: "0.2rem 0.6rem", fontWeight: 500 }}>
                      {isOnline ? (score > 80 ? "Active" : score > 50 ? "Medium" : "Idle") : "Offline"}
                    </span>
                  </td>
                  <td>
                    <span className="badge-pill badge-offline" style={{ padding: "0.2rem 0.6rem", fontWeight: 500 }}>
                      {isOnline ? (score > 85 ? "High" : score > 40 ? "Medium" : "Idle") : "Offline"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      {user.department || "Operations"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        <div className="data-table-container">
          <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>Recent Activity Feed</h3>
            <p className="page-desc" style={{ color: "var(--text-light)" }}>Live log of employee events and application usage.</p>
          </div>
          <div style={{ padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.4)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, fontStyle: "italic" }}>Awaiting incoming telemetry data...</p>
          </div>
        </div>

        <div className="data-table-container">
          <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>Live Tracking Panel</h3>
            <p className="page-desc" style={{ color: "var(--text-light)" }}>Real-time aggregated workforce metrics.</p>
          </div>
          <div style={{ padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.4)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, fontStyle: "italic" }}>No active sessions to track.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <AnalyticsDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
