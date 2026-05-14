import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDevices, useDashboardStats } from "../hooks/useFirestoreData";
import { useActivityData } from "../hooks/useActivityData";
import { useAuth } from "../contexts/AuthContext";
import StatCard from "../components/StatCard";
import ProductivityChart from "../components/ProductivityChart";
import SystemGauges from "../components/SystemGauges";
import ActivityTimeline from "../components/ActivityTimeline";
import AnalyticsDrawer from "../components/AnalyticsDrawer";
import {
  Clock, Zap, Mouse, Keyboard, TrendingUp, Coffee,
  Cpu, MemoryStick, Monitor, Users, Wifi, AppWindow,
  Activity, Play, WifiOff, ChevronDown, ChevronUp,
  Eye, Server, Globe, Layers, Search, SlidersHorizontal, BarChart3, Trash2,
} from "lucide-react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const API = "http://localhost:4000/api";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { employees, online, total, aggregated, loading } = useDashboardStats();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOnline, setFilterOnline] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter & Sort
  const filteredUsers = (employees || []).filter(u => {
    const matchesSearch = (u.displayName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (u.userEmail || u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = filterOnline ? u.isOnline : true;
    return matchesSearch && matchesOnline;
  }).sort((a, b) => {
    if (sortBy === "productivity") return (b.productivityScore || 0) - (a.productivityScore || 0);
    if (sortBy === "attendance") return (b.activeHours || 0) - (a.activeHours || 0);
    return (a.displayName || "").localeCompare(b.displayName || "");
  });

  const agg = {
    totalUsers: total,
    onlineUsers: online,
    totalActiveHours: (aggregated?.totalActiveHours || 0).toFixed(1),
    avgProductivity: aggregated?.avgProductivity || 0,
  };

  async function handleDelete(user) {
    if (!window.confirm(`Are you sure you want to remove ${user.displayName}? This will delete their profile data.`)) return;
    try {
      await deleteDoc(doc(db, "users", user.id));
      // If there's a corresponding device, we might want to delete it too
      // await deleteDoc(doc(db, "devices", user.deviceId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete user: " + err.message);
    }
  }

  function timeAgo(iso) {
    if (!iso) return "--";
    const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p>Syncing Enterprise Data...</p>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Filter Bar */}
      <div className="dashboard-controls card-glass" style={{ display: 'flex', gap: '1rem', background: 'var(--bg2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <Search size={18} color="var(--text3)" />
          <input 
            type="text" 
            placeholder="Search employees by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>
        <div className="filter-group" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => setFilterOnline(!filterOnline)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: filterOnline ? 'var(--blue)' : 'rgba(255,255,255,0.05)', color: filterOnline ? '#fff' : 'var(--text2)', cursor: 'pointer' }}
          >
            <Wifi size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Online Only</span>
          </button>
          <div className="sort-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)' }}>
            <SlidersHorizontal size={16} color="var(--text3)" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text)', outline: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <option value="name">Sort by Name</option>
              <option value="productivity">Sort by Productivity</option>
              <option value="attendance">Sort by Attendance</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard title="Total Employees" value={agg.totalUsers} icon={<Users />} color="blue" />
        <StatCard title="Currently Online" value={agg.onlineUsers} icon={<Activity />} color="green" />
        <StatCard title="Total Work Hours" value={`${agg.totalActiveHours}h`} icon={<Clock />} color="purple" />
        <StatCard title="Avg. Productivity" value={`${agg.avgProductivity}%`} icon={<Zap />} color="cyan" />
      </div>

      {/* Employee Grid */}
      <div className="section-header">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Team Overview</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>Real-time activity and attendance tracking</p>
      </div>

      <div className="user-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((user, idx) => {
            const isOnline = user.isOnline;
            const hours = user.activeHours || 0;
            const attendanceStatus = hours >= 8 ? "Present" : hours >= 4 ? "Half Day" : "Absent";
            const attendanceColor = hours >= 8 ? "var(--green)" : hours >= 4 ? "var(--blue)" : "var(--red)";

            return (
              <motion.div 
                key={`${user.id}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="employee-card-v2"
                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', padding: '1.25rem', position: 'relative' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                      {(user.displayName || user.fullName || user.userName || user.name || user.userEmail || "U")?.[0]}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>{user.displayName || user.fullName || user.userName || user.name || user.userEmail}</h4>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{user.deviceName || user.hostname || "—"}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 700, color: isOnline ? '#22c55e' : '#64748b' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#64748b' }} />
                    {isOnline ? "ONLINE" : "OFFLINE"}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                      style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                      title="Remove Employee"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <AppWindow size={14} color="#818cf8" />
                    <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isOnline ? (user.currentApp || "Productive Work") : "System Inactive"}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '1.5rem' }}>
                    {isOnline ? "Active Process Tracking..." : `Last seen ${timeAgo(user.lastSeen)}`}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div className="mini-stat-v2">
                    <span className="ms-label">Work Hours</span>
                    <span className="ms-value" style={{ color: '#f1f5f9' }}>
                      {Math.floor(hours)}h {Math.round((hours % 1) * 60)}m
                    </span>
                  </div>
                  <div className="mini-stat-v2">
                    <span className="ms-label">Productivity</span>
                    <span className="ms-value" style={{ color: '#22c55e' }}>{user.productivityScore || 0}%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Keyboard size={12} color="#94a3b8" />
                    <span style={{ fontSize: '0.75rem', color: '#f1f5f9', fontWeight: 700 }}>{user.keystrokes?.toLocaleString() || 0}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mouse size={12} color="#94a3b8" />
                    <span style={{ fontSize: '0.75rem', color: '#f1f5f9', fontWeight: 700 }}>{user.mouseClicks?.toLocaleString() || 0}</span>
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--blue)' }}>
                    {user.typingSpeed || 0} WPM
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1rem' }}>
                  <button 
                    onClick={() => {
                      // Navigate to All Devices and select this device
                      // Since we're using a simple state-based SPA, we'll need to communicate with AppShell
                      // For now, we'll use a simple alert or just open the summary
                      setSelectedUser(user);
                    }}
                    style={{ flex: 1, background: 'var(--blue)', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <Eye size={14} /> Open Monitor
                  </button>
                  <button 
                    onClick={() => setSelectedUser(user)}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <BarChart3 size={14} /> Summary
                  </button>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Users size={48} color="var(--text3)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Employees Found</h4>
            <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Go to Login and click "Create Account" to register new employees.</p>
          </div>
        )}
      </div>

      {/* Weekly Analytics Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <AnalyticsDrawer 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
