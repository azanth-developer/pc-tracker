import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConsolidatedData } from "../hooks/useConsolidatedData";
import { UserAvatar } from "../components/ProfessionalComponents";
import { Users, UserCheck, UserMinus, Laptop, Search, Filter } from "lucide-react";
import AnalyticsDrawer from "../components/AnalyticsDrawer";

export default function Dashboard() {
  const { users, enrichedDevices, aggregated, loading } = useConsolidatedData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.employeeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => (b.productivityScore || 0) - (a.productivityScore || 0));
  }, [users, searchQuery]);

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
          <p className="page-desc">Overview of your team's daily status.</p>
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
            <div style={{ background: "var(--success-bg)", color: "var(--success)", padding: "0.75rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCheck size={20} />
            </div>
            <div>
              <p className="stat-label">Present Today</p>
              <h3 className="stat-value">{aggregated.onlineUsers}</h3>
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
            <div style={{ background: "#f3e8ff", color: "#9333ea", padding: "0.75rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Laptop size={20} />
            </div>
            <div>
              <p className="stat-label">Devices Online</p>
              <h3 className="stat-value">{enrichedDevices.filter(d => d.isOnline).length}</h3>
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
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice(0, 10).map((user) => {
              const device = enrichedDevices.find(d => d.uid === user.uid);
              const isOnline = device?.isOnline;
              const score = user.productivityScore || 82;
              
              return (
                <tr key={user.uid} style={{ cursor: "pointer" }} onClick={() => setSelectedUser(user)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <UserAvatar user={user} size={36} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>{user.employeeName || user.displayName || user.name || user.email?.split('@')[0] || "Unknown User"}</p>
                        <p className="truncate" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ width: "200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>{score}%</span>
                      <div style={{ flex: 1, height: "6px", background: "var(--bg)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${score}%`, height: "100%", background: score >= 80 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--danger)" }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-pill ${isOnline ? 'badge-online' : 'badge-offline'}`}>
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                      {user.department || "Operations"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <AnalyticsDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
