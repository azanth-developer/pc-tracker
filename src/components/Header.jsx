import React, { useState, useRef, useEffect } from "react";
import { 
  Menu, Bell, Search, Clock, Wifi, WifiOff, 
  X, Check, LogOut, User, Settings, ChevronDown, Activity, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLiveClock } from "../hooks/useLiveClock";
import { useNotifications } from "../hooks/useNotifications";
import { useConsolidatedData } from "../hooks/useConsolidatedData";

const PAGE_LABELS = {
  dashboard:    "Dashboard",
  employees:    "Employees",
  attendance:   "Attendance",
  devices:      "Devices",
  settings:     "Settings",
};

export default function Header({ activePage, sidebarOpen, setSidebarOpen, onSearch }) {
  const { currentUser, logout, userProfile } = useAuth();
  const { formatted } = useLiveClock();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const { enrichedDevices } = useConsolidatedData();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const totalDevices = enrichedDevices.length;
  const onlineDevices = enrichedDevices.filter(d => d.isOnline).length;
  
  let telemetryStatus = { label: "Offline", class: "badge-offline", icon: <WifiOff size={14} /> };
  if (onlineDevices > 0) {
    telemetryStatus = { label: "Online", class: "badge-online", icon: <Wifi size={14} /> };
  }

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split("@")[0] || "Administrator";
  const initials = displayName[0]?.toUpperCase() || "A";

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)}>
          <Menu size={18} />
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-current">{PAGE_LABELS[activePage] || "Platform"}</span>
        </div>
      </div>

      <div className="header-actions">
        <div className="search-input-wrap" style={{ minWidth: "240px", maxWidth: "320px" }}>
          <Search size={16} className="search-icon" />
          <input
            placeholder="Search..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
          />
        </div>

        <div className={`badge-pill ${telemetryStatus.class}`}>
          {telemetryStatus.icon}
          <span>{telemetryStatus.label}</span>
        </div>

        <div className="notif-wrap" ref={notifRef} style={{ position: "relative" }}>
          <button className="header-icon-btn" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge-dot" />}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="modal-content" 
                style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "320px", zIndex: 1000, padding: "1rem" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>Notifications</h4>
                  <button onClick={markAllRead} style={{ fontSize: "0.75rem", color: "var(--primary)", border: "none", background: "none", fontWeight: 500, cursor: "pointer" }}>Mark all read</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                       <Check size={24} style={{ color: "var(--text-light)", margin: "0 auto 0.5rem" }} />
                       <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No new notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div key={n.id} style={{ padding: "0.75rem", borderRadius: "8px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                           <AlertTriangle size={16} style={{ color: "var(--warning)", marginTop: "0.1rem" }} />
                           <div>
                             <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>{n.title}</p>
                             <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{n.message}</p>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="profile-wrap" ref={profileRef} style={{ position: "relative" }}>
          <button style={{ background: "transparent", border: "none", display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setShowProfile(!showProfile)}>
            <div className="avatar-base" style={{ width: "36px", height: "36px", fontSize: "0.875rem" }}>
              {initials}
            </div>
            <ChevronDown size={16} style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="modal-content" 
                style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "220px", zIndex: 1000, padding: "0.5rem" }}
              >
                <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", marginBottom: "0.5rem" }}>
                  <p className="truncate" style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-main)" }}>{displayName}</p>
                  <p className="truncate" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{currentUser?.email}</p>
                </div>
                <button className="sidebar-nav-item" onClick={() => {}} style={{ margin: "0.25rem" }}>
                  <User size={16} className="nav-icon" /> <span className="nav-label">Profile</span>
                </button>
                <button className="sidebar-nav-item" onClick={() => {}} style={{ margin: "0.25rem" }}>
                  <Settings size={16} className="nav-icon" /> <span className="nav-label">Settings</span>
                </button>
                <div style={{ height: "1px", background: "var(--border)", margin: "0.5rem" }} />
                <button className="sidebar-nav-item" onClick={logout} style={{ color: "var(--danger)", margin: "0.25rem" }}>
                  <LogOut size={16} className="nav-icon" /> <span className="nav-label">Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
