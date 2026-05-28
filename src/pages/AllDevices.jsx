import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useConsolidatedData } from "../hooks/useConsolidatedData";
import { UserAvatar } from "../components/ProfessionalComponents";
import { Laptop, Search, Filter, Trash2, Settings, Monitor, Clock } from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { deleteEmployeeCompletely } from "../utils/firebaseUtils";

export default function Workstations() {
  const { users, employeeDevices, loading } = useConsolidatedData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [deletingDevice, setDeletingDevice] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const usersMap = useMemo(() => {
    return Object.fromEntries(users.map(u => [u.uid, u]));
  }, [users]);

  const filteredDevices = useMemo(() => {
    return employeeDevices.filter(d => {
      const employee = usersMap[d.uid];
      const employeeName = employee?.employeeName || employee?.displayName || "Unassigned";
      
      const matchesSearch = 
        employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.displayName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.hostname || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "All" || (filterStatus === "Online" ? d.isOnline : !d.isOnline);
      return matchesSearch && matchesStatus;
    });
  }, [enrichedDevices, searchQuery, filterStatus, usersMap]);

  const handleDelete = async () => {
    if (!deletingDevice) return;
    setIsDeleting(true);
    try {
      await deleteEmployeeCompletely({ uid: deletingDevice.uid, deviceId: deletingDevice.deviceId });
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setDeletingDevice(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p>Loading devices...</p>
      </div>
    );
  }

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Devices</h2>
          <p className="page-desc">Manage employee devices and connections.</p>
        </div>
      </div>

      <div className="chart-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-input-wrap" style={{ flex: 2, minWidth: "200px" }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by device name or employee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "150px" }}>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="search-input"
              style={{ paddingLeft: "1rem" }}
            >
              <option value="All">All Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {filteredDevices.map((device) => {
          const employee = usersMap[device.uid];
          const employeeName = employee?.employeeName || employee?.displayName || "Unassigned";

          return (
            <motion.div layout key={device.deviceId} className="stat-card device-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ background: "var(--bg)", padding: "0.75rem", borderRadius: "10px", color: "var(--text-muted)" }}>
                      <Laptop size={20} />
                    </div>
                    <div>
                      <h3 className="truncate" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)", maxWidth: "150px" }}>
                        {device.displayName || device.hostname}
                      </h3>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{device.os || "OS"} • {device.ipAddress || "No IP"}</p>
                    </div>
                  </div>
                  <span className={`badge-pill ${device.isOnline ? 'badge-online' : 'badge-offline'}`} style={{ padding: "0.25rem 0.75rem" }}>
                    {device.isOnline ? (
                      <><span className="status-dot online" style={{ marginRight: "4px" }} /> Online</>
                    ) : "Offline"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(15, 23, 42, 0.4)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <UserAvatar user={employee || device} size={32} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "2px" }}>{employeeName}</p>
                    <p className="truncate" style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>Assigned User</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: "1rem 1.25rem", background: "rgba(15, 23, 42, 0.4)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                
                {/* Metrics Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>CPU</span>
                      {device.isOnline && <span className="status-dot online" style={{ width: 4, height: 4, animationDuration: "1s" }} />}
                    </div>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-main)", fontWeight: 500 }}>
                      <motion.span key={device.cpu} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        {device.cpu || 0}%
                      </motion.span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>RAM</span>
                      {device.isOnline && <span className="status-dot online" style={{ width: 4, height: 4, animationDuration: "1s", animationDelay: "0.5s" }} />}
                    </div>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-main)", fontWeight: 500 }}>
                      <motion.span key={device.ramPercent} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        {device.ramPercent || 0}%
                      </motion.span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>Uptime</span>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-main)", fontWeight: 500 }}>{device.uptimeMinutes ? `${Math.floor(device.uptimeMinutes / 60)}h ${device.uptimeMinutes % 60}m` : '0h 0m'}</span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "var(--border)" }} />

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--primary)", padding: "0.5rem", borderRadius: "6px" }}>
                      <Monitor size={14} />
                    </div>
                    {device.isOnline && (
                      <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "var(--danger)", borderRadius: "50%", border: "2px solid var(--bg-card)", boxShadow: "0 0 5px var(--danger)" }} className="animate-pulse" title="Live Screen Tracking" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <motion.p key={device.currentApp} initial={{ opacity: 0.5, x: -5 }} animate={{ opacity: 1, x: 0 }} className="truncate" style={{ fontSize: "0.875rem", color: "var(--text-main)", fontWeight: 500 }}>
                        {device.currentApp || "Desktop"}
                      </motion.p>
                      {device.isOnline && (
                        <span style={{ fontSize: "0.6rem", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "2px 6px", borderRadius: "10px", fontWeight: 700, letterSpacing: "0.5px" }} className="animate-pulse">LIVE</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "2px" }}>
                      <Clock size={12} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{device.isOnline ? `Active for ${device.activeHours ? parseFloat(device.activeHours).toFixed(1) + 'h' : 'recent'}` : "Last Active: Unknown"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderTop: "1px solid var(--border)", background: "var(--bg-card)", transition: "background 0.2s" }} className="tr-hover">
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>Quick Actions</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                   <button className="header-icon-btn" style={{ width: "32px", height: "32px" }}><Settings size={14} /></button>
                   <button className="header-icon-btn" style={{ width: "32px", height: "32px", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)" }} onClick={() => setDeletingDevice(device)}><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <DeleteConfirmModal 
        isOpen={!!deletingDevice}
        title="Remove Device"
        message={`Are you sure you want to remove ${deletingDevice?.displayName}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingDevice(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
