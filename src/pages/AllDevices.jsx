import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useConsolidatedData } from "../hooks/useConsolidatedData";
import { UserAvatar } from "../components/ProfessionalComponents";
import { Laptop, Search, Filter, Trash2, Settings, Monitor, Clock } from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { deleteEmployeeCompletely } from "../utils/firebaseUtils";

export default function Workstations() {
  const { users, enrichedDevices, loading } = useConsolidatedData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [deletingDevice, setDeletingDevice] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const usersMap = useMemo(() => {
    return Object.fromEntries(users.map(u => [u.uid, u]));
  }, [users]);

  const filteredDevices = useMemo(() => {
    return enrichedDevices.filter(d => {
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
            <motion.div layout key={device.deviceId} className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)" }}>
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
                  <span className={`badge-pill ${device.isOnline ? 'badge-online' : 'badge-offline'}`}>
                    {device.isOnline ? "Online" : "Offline"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--bg)", padding: "0.75rem", borderRadius: "8px" }}>
                  <UserAvatar user={employee || device} size={32} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>{employeeName}</p>
                    <p className="truncate" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Assigned User</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: "1rem 1.25rem", background: "var(--bg)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Monitor size={14} style={{ color: "var(--text-muted)" }} />
                  <p className="truncate" style={{ fontSize: "0.875rem", color: "var(--text-main)", flex: 1 }}>{device.currentApp || "Idle"}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={14} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{device.isOnline ? "Active Now" : "Inactive"}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Settings</span>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                   <button className="header-icon-btn" style={{ width: "28px", height: "28px" }}><Settings size={14} /></button>
                   <button className="header-icon-btn" style={{ width: "28px", height: "28px", color: "var(--danger)" }} onClick={() => setDeletingDevice(device)}><Trash2 size={14} /></button>
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
