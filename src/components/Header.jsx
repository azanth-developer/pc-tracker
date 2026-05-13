import { useState, useRef, useEffect } from "react";
import { Menu, Bell, Search, Clock, Wifi, WifiOff, X, Check, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLiveClock } from "../hooks/useLiveClock";
import { useNotifications } from "../hooks/useNotifications";
import { useDevices } from "../hooks/useFirestoreData";

// Electron IPC helper
const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
let ipcRenderer = null;
if (isElectron) {
  try {
    ipcRenderer = window.require('electron').ipcRenderer;
  } catch (e) {}
}

const PAGE_LABELS = {
  dashboard:   "Dashboard",
  live:        "Live Monitoring",
  alldevices:  "All Devices",
  reports:     "Reports",
  attendance:  "Attendance",
  system:      "System Statistics",
  analytics:   "User Analytics",
  devices:     "Devices & Files",
  screenshots: "Screenshots",
  settings:    "Settings",
};

const NOTIF_ICONS = {
  online:  <Wifi size={14} />,
  offline: <WifiOff size={14} />,
  idle:    <Clock size={14} />,
  alert:   <Bell size={14} />,
};

const NOTIF_COLORS = {
  online:  "notif-green",
  offline: "notif-red",
  idle:    "notif-orange",
  alert:   "notif-red",
};

export default function Header({ activePage, sidebarOpen, setSidebarOpen, onSearch }) {
  const { currentUser, logout, userProfile, isAdmin } = useAuth();
  const { formatted, date } = useLiveClock();
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const { devices } = useDevices();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Check if current user is being monitored
  const myDevice = (devices || []).find(d => d.userEmail === currentUser?.email);
  const isMonitored = myDevice?.isOnline || false;

  function handleStartAgent() {
    if (ipcRenderer && currentUser) {
      ipcRenderer.send('auth-success-start-monitor', {
        uid: currentUser.uid,
        email: currentUser.email
      });
      alert("Monitoring Agent signal sent to system.");
    } else {
      alert("Please run this in the PC Tracker Desktop App to enable monitoring.");
    }
  }

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";
  const initials = displayName[0]?.toUpperCase() || "U";
  const photoURL = currentUser?.photoURL;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e) {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  }

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="header-menu-btn"
          onClick={() => setSidebarOpen(v => !v)}
        >
          <Menu size={20} />
        </button>
        <div className="header-breadcrumb">
          <span className="breadcrumb-root">PC Tracker</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-page">{PAGE_LABELS[activePage]}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Monitoring Status */}
        <div className="header-monitor-status" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.8rem', borderRadius: '20px', background: isMonitored ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${isMonitored ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isMonitored ? '#22c55e' : '#ef4444', boxShadow: isMonitored ? '0 0 10px #22c55e' : 'none' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isMonitored ? '#22c55e' : '#ef4444' }}>
            {isMonitored ? "MONITORING ACTIVE" : "MONITORING INACTIVE"}
          </span>
        </div>

        {/* Live Clock */}
        <div className="header-clock">
          <Clock size={13} />
          <span className="clock-time">{formatted}</span>
          <span className="clock-date">{date}</span>
        </div>

        {/* Search */}
        <div className="header-search">
          <Search size={14} />
          <input
            placeholder="Search users, devices..."
            className="header-search-input"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Notifications */}
        <div className="notif-wrap" ref={notifRef}>
          <button
            className="header-icon-btn"
            title="Notifications"
            onClick={() => setShowNotifs(v => !v)}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="notif-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h4>Notifications</h4>
                <div className="notif-actions">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="notif-action-btn" title="Mark all read">
                      <Check size={13} /> Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={clearAll} className="notif-action-btn" title="Clear all">
                      <X size={13} /> Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <p className="notif-empty">No notifications</p>
                ) : (
                  notifications.slice(0, 15).map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${n.read ? "" : "notif-unread"}`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className={`notif-icon-wrap ${NOTIF_COLORS[n.type]}`}>
                        {NOTIF_ICONS[n.type]}
                      </div>
                      <div className="notif-content">
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-msg">{n.message}</p>
                      </div>
                      <span className="notif-time">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar + Profile Dropdown */}
        <div className="profile-wrap" ref={profileRef}>
          <button
            className="profile-trigger"
            onClick={() => setShowProfile(v => !v)}
            title={currentUser?.email || "Profile"}
          >
            {photoURL ? (
              <img src={photoURL} alt="" className="profile-avatar-img" />
            ) : (
              <div className="header-avatar">{initials}</div>
            )}
            <ChevronDown size={12} className={`profile-chevron ${showProfile ? "profile-chevron-up" : ""}`} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-dd-header">
                {photoURL ? (
                  <img src={photoURL} alt="" className="profile-dd-img" />
                ) : (
                  <div className="profile-dd-avatar">{initials}</div>
                )}
                <div className="profile-dd-info">
                  <p className="profile-dd-name">{displayName}</p>
                  <p className="profile-dd-email">{currentUser?.email || ""}</p>
                  <span className="profile-dd-role">{isAdmin ? "Admin" : "Employee"}</span>
                </div>
              </div>
              <div className="profile-dd-divider" />
              <button className="profile-dd-item" onClick={() => { setShowProfile(false); }}>
                <User size={14} />
                <span>Profile</span>
              </button>
              <button className="profile-dd-item" onClick={() => { setShowProfile(false); }}>
                <Settings size={14} />
                <span>Settings</span>
              </button>
              <div className="profile-dd-divider" />
              <button className="profile-dd-item profile-dd-logout" onClick={logout}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
