import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConsolidatedData } from "../hooks/useConsolidatedData";
import { UserAvatar } from "../components/ProfessionalComponents";
import { 
  Users, Search, Filter, Plus, 
  MoreVertical, Edit2, Trash2, Mail, 
  Briefcase, Grid, List, Download, 
  Hash, ShieldCheck
} from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import AddEmployeeModal from "../components/AddEmployeeModal";
import { deleteEmployeeCompletely } from "../utils/firebaseUtils";
import { exportToCSV } from "../utils/csvExport";

export default function Employees() {
  const { employees, employeeDevices, loading } = useConsolidatedData();
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [deletingUser, setDeletingUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredUsers = useMemo(() => {
    return employees.filter(u => {
      const name = u.employeeName || u.displayName || u.name || u.email || "";
      const matchesSearch = 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept === "All" || u.department === filterDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, filterDept]);

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const device = employeeDevices.find(d => d.uid === deletingUser.uid);
      await deleteEmployeeCompletely({ uid: deletingUser.uid, deviceId: device?.deviceId });
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredUsers.map(user => ({
      "Employee ID": user.employeeId || "EMP-000",
      "Full Name": user.employeeName || user.displayName || user.name || user.email?.split('@')[0] || "Unknown",
      "Email": user.email || "",
      "Department": user.department || "Operations",
      "Role": user.role || "Employee",
      "Productivity Score": `${user.productivityScore || 82}%`,
      "System Status": enrichedDevices.find(d => d.uid === user.uid)?.isOnline ? "Online" : "Offline"
    }));
    exportToCSV(dataToExport, "Employee_Directory");
    showToast("Export completed successfully.");
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p>Loading employees...</p>
      </div>
    );
  }

  const departments = ["All", ...new Set(users.map(u => u.department).filter(Boolean))];

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Employees</h2>
          <p className="page-desc">Manage your organization's team members and roles.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={{ display: "flex", background: "var(--bg-card)", borderRadius: "8px", padding: "0.25rem", border: "1px solid var(--border)" }}>
            <button 
              onClick={() => setViewMode("grid")}
              style={{ width: "32px", height: "32px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === "grid" ? "var(--bg)" : "transparent", color: viewMode === "grid" ? "var(--primary)" : "var(--text-muted)", border: "none", cursor: "pointer", transition: "all 0.2s" }}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              style={{ width: "32px", height: "32px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === "list" ? "var(--bg)" : "transparent", color: viewMode === "list" ? "var(--primary)" : "var(--text-muted)", border: "none", cursor: "pointer", transition: "all 0.2s" }}
            >
              <List size={16} />
            </button>
          </div>
          <button className="btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      <div className="chart-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-input-wrap" style={{ flex: 2, minWidth: "200px" }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
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
            <button className="header-icon-btn" onClick={handleExport} title="Download CSV">
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="stats-grid" 
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
          >
            {filteredUsers.map((user) => {
              const displayName = user.employeeName || user.displayName || user.name || user.email?.split('@')[0] || "Unknown User";
              
              return (
                <motion.div layout key={user.uid} className="stat-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <UserAvatar user={user} size={56} />
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button className="header-icon-btn" style={{ width: "28px", height: "28px" }}><Edit2 size={14} /></button>
                      <button onClick={() => setDeletingUser(user)} className="header-icon-btn" style={{ width: "28px", height: "28px", color: "var(--danger)" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "1rem" }}>
                    <h3 className="truncate" style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>{displayName}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
                      <ShieldCheck size={14} /> {user.role || "Employee"}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "var(--bg)", padding: "1rem", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-main)", fontSize: "0.875rem" }}>
                      <Briefcase size={14} style={{ color: "var(--text-muted)" }} /> {user.department || "Operations"}
                    </div>
                    <div className="truncate" style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-main)", fontSize: "0.875rem" }}>
                      <Mail size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} /> <span className="truncate">{user.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-main)", fontSize: "0.875rem" }}>
                      <Hash size={14} style={{ color: "var(--text-muted)" }} /> ID: {user.employeeId || "EMP-000"}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="data-table-container"
          >
            <div className="data-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Productivity Score</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const displayName = user.employeeName || user.displayName || user.name || user.email?.split('@')[0] || "Unknown User";
                    const score = user.productivityScore || 82;
                    
                    return (
                      <tr key={user.uid}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <UserAvatar user={user} size={36} />
                            <div style={{ minWidth: 0 }}>
                              <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>{displayName}</p>
                              <p className="truncate" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontSize: "0.875rem", color: "var(--text-main)" }}>{user.role || "Employee"}</span></td>
                        <td>
                          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                            {user.department || "Operations"}
                          </span>
                        </td>
                        <td style={{ minWidth: "150px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>{score}%</span>
                            <div style={{ flex: 1, height: "6px", background: "var(--bg)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${score}%`, height: "100%", background: score >= 80 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--danger)" }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button className="header-icon-btn" title="Edit"><Edit2 size={16} /></button>
                            <button className="header-icon-btn" style={{ color: "var(--danger)" }} onClick={() => setDeletingUser(user)} title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddEmployeeModal isOpen={isAdding} onClose={() => setIsAdding(false)} />

      <DeleteConfirmModal 
        isOpen={!!deletingUser}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deletingUser?.employeeName || deletingUser?.displayName}? All associated data will be removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingUser(null)}
        isLoading={isDeleting}
      />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", background: "var(--primary)", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "8px", boxShadow: "var(--shadow)", zIndex: 2000, fontSize: "0.875rem", fontWeight: 500 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
