import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConsolidatedData } from "../hooks/useConsolidatedData";
import { UserAvatar } from "../components/ProfessionalComponents";
import { 
  Eye, Trash2, MoreHorizontal, Calendar, Search, Download, 
  ArrowUpRight, ArrowDownRight, Activity, Users
} from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { deleteEmployeeCompletely } from "../utils/firebaseUtils";
import { exportToCSV } from "../utils/csvExport";
import AnalyticsDrawer from "../components/AnalyticsDrawer";

export default function Attendance({ setActivePage }) {
  const { users, enrichedDevices, loading, aggregated } = useConsolidatedData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [deletingUser, setDeletingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuOpenUserId, setMenuOpenUserId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredAttendance = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        (u.employeeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept === "All" || u.department === filterDept;
      const device = enrichedDevices.find(d => d.uid === u.uid);
      const isOnline = device?.isOnline;
      const status = isOnline ? "Present" : "Absent";
      const matchesStatus = filterStatus === "All" || status === filterStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [users, enrichedDevices, searchQuery, filterDept, filterStatus]);

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const device = enrichedDevices.find(d => d.uid === deletingUser.uid);
      await deleteEmployeeCompletely({ uid: deletingUser.uid, deviceId: device?.deviceId });
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredAttendance.map(user => {
      const device = enrichedDevices.find(d => d.uid === user.uid);
      return {
        "Employee ID": user.employeeId || "EMP-000",
        "Full Name": user.employeeName || user.displayName || user.name || user.email?.split('@')[0] || "Unknown",
        "Department": user.department || "Operations",
        "Date": new Date().toLocaleDateString(),
        "Clock-In": "09:00 AM",
        "Active Hours": parseFloat(device?.activeHours || 0).toFixed(1),
        "Status": device?.isOnline ? "Present" : "Absent"
      };
    });
    exportToCSV(dataToExport, "Daily_Attendance_Report");
    showToast("Attendance report downloaded.");
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p>Loading attendance...</p>
      </div>
    );
  }

  const departments = ["All", ...new Set(users.map(u => u.department).filter(Boolean))];

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Attendance</h2>
          <p className="page-desc">Manage employee presence and daily working hours.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <button className="btn-primary" onClick={() => showToast("Leave management opened.")}>
            <Calendar size={16} /> Add Leave
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: "Present Today", value: aggregated.onlineUsers, color: "var(--success)", bg: "var(--success-bg)", icon: ArrowUpRight },
          { label: "Absent", value: aggregated.offlineUsers, color: "var(--danger)", bg: "var(--danger-bg)", icon: ArrowDownRight },
          { label: "Total Hours", value: `${Math.floor(aggregated.totalActiveHours)}h`, color: "var(--primary)", bg: "var(--primary-light)", icon: Activity },
          { label: "Total Employees", value: aggregated.totalUsers, color: "var(--text-muted)", bg: "var(--bg)", icon: Users },
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={{ padding: "1.25rem", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ background: stat.bg, color: stat.color, padding: "0.5rem", borderRadius: "8px" }}>
                <stat.icon size={18} />
              </div>
            </div>
            <div>
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="data-table-container">
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", background: "var(--bg-card)" }}>
          <div className="search-input-wrap" style={{ flex: 2, minWidth: "200px" }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "250px" }}>
            <select 
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="search-input"
              style={{ paddingLeft: "1rem" }}
            >
              {departments.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
            </select>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="search-input"
              style={{ paddingLeft: "1rem" }}
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Clock-In</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((user) => {
                const device = enrichedDevices.find(d => d.uid === user.uid);
                const isOnline = device?.isOnline;
                const activeHours = parseFloat(device?.activeHours || 0);
                
                return (
                  <tr key={user.uid}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <UserAvatar user={user} size={36} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>{user.employeeName || user.displayName || user.name || user.email?.split('@')[0] || "Unknown User"}</p>
                          <p className="truncate" style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>ID: {user.employeeId || "EMP-000"}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.875rem", color: "var(--text-main)" }}>
                        {user.department || "Operations"}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-main)" }}>09:00 AM</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date().toLocaleDateString()}</p>
                    </td>
                    <td style={{ minWidth: "140px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {activeHours.toFixed(1)}h
                        </span>
                        <div style={{ width: "60px", height: "6px", background: "var(--bg)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(100, activeHours * 10)}%`, height: "100%", background: "var(--primary)", borderRadius: "3px" }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-pill ${isOnline ? 'badge-online' : 'badge-offline'}`}>
                        {isOnline ? "Present" : "Absent"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", position: "relative" }}>
                        <button className="header-icon-btn" title="View Details" onClick={() => setSelectedUser(user)}>
                          <Eye size={16} />
                        </button>
                        <button className="header-icon-btn" title="Delete" onClick={() => setDeletingUser(user)} style={{ color: "var(--danger)" }}>
                          <Trash2 size={16} />
                        </button>
                        
                        <div style={{ position: "relative" }}>
                          <button className="header-icon-btn" onClick={() => setMenuOpenUserId(menuOpenUserId === user.uid ? null : user.uid)}>
                            <MoreHorizontal size={16} />
                          </button>
                          
                          <AnimatePresence>
                            {menuOpenUserId === user.uid && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="modal-content"
                                style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "160px", zIndex: 100, padding: "0.5rem" }}
                              >
                                {[
                                  { label: "Profile", icon: Eye, action: () => showToast(`Opening profile for ${user.employeeName}`) },
                                  { label: "Devices", icon: Activity, action: () => setActivePage('devices') },
                                  { label: "Export", icon: Download, action: () => showToast(`Exporting data for ${user.employeeName}`) },
                                ].map((opt, i) => (
                                  <button key={i} onClick={() => { opt.action(); setMenuOpenUserId(null); }} className="sidebar-nav-item" style={{ fontSize: "0.875rem", padding: "0.5rem", borderRadius: "6px" }}>
                                    <opt.icon size={14} className="nav-icon" /> <span className="nav-label">{opt.label}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={!!deletingUser}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deletingUser?.employeeName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingUser(null)}
        isLoading={isDeleting}
      />

      <AnimatePresence>
        {selectedUser && <AnalyticsDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", background: "var(--text-main)", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "8px", boxShadow: "var(--shadow)", zIndex: 2000, fontSize: "0.875rem", fontWeight: 500 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
