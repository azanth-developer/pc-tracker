import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDevices } from "../hooks/useFirestoreData";
import AnalyticsDrawer from "../components/AnalyticsDrawer";
import LiveMonitoring from "./LiveMonitoring";
import { Monitor, Search, SlidersHorizontal, Activity, AppWindow, Clock, Zap, ChevronRight, Eye, BarChart3, Keyboard, Trash2, ArrowLeft, Wifi, WifiOff, Cpu, Mouse } from "lucide-react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AllDevices() {
  const { devices, online, total, loading } = useDevices();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOnline, setFilterOnline] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [showAnalyticsFor, setShowAnalyticsFor] = useState(null);

  // Filter & Sort Logic
  const filtered = useMemo(() => {
    let list = [...devices];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => 
        (d.hostname || "").toLowerCase().includes(q) || 
        (d.userEmail || "").toLowerCase().includes(q)
      );
    }
    if (filterOnline) list = list.filter(d => d.isOnline);
    
    list.sort((a, b) => {
      if (sortBy === "productivity") return (b.productivityScore || 0) - (a.productivityScore || 0);
      if (sortBy === "active") return (b.activeHours || 0) - (a.activeHours || 0);
      return (a.hostname || "").localeCompare(b.hostname || "");
    });
    return list;
  }, [devices, searchQuery, filterOnline, sortBy]);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  function timeAgo(iso) {
    if (!iso) return "Never";
    const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  // DRILL-DOWN VIEW
  if (selectedDeviceId && selectedDevice) {
    return (
      <div className="page-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setSelectedDeviceId(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Back to All Devices
          </button>
        </div>
        
        <div className="detail-header card-glass" style={{ background: 'var(--bg2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={28} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>{selectedDevice.hostname}</h2>
              <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{selectedDevice.userEmail} • {selectedDevice.isOnline ? "🟢 Live Streaming" : "🔴 Offline"}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAnalyticsFor(selectedDevice)}
            style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <BarChart3 size={18} /> Performance Summary
          </button>
        </div>

        {/* Reuse LiveMonitoring logic but for this specific device */}
        <LiveMonitoring deviceId={selectedDeviceId} />

        <AnimatePresence>
          {showAnalyticsFor && (
            <AnalyticsDrawer user={showAnalyticsFor} onClose={() => setShowAnalyticsFor(null)} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div className="page-content">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Workstation Monitoring</h2>
          <p className="page-desc">Centralized command center for all employee devices</p>
        </div>
        <div className="live-badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.8rem', fontWeight: 700 }}>
          {online} Online / {total} Total
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="dashboard-controls card-glass" style={{ display: 'flex', gap: '1rem', background: 'var(--bg2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="search-box" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <Search size={18} color="var(--text3)" />
          <input 
            type="text" 
            placeholder="Search by device name or employee email..." 
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
              <option value="active">Sort by Active Hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Device Grid */}
      <div className="device-grid-v3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence mode="popLayout">
          {filtered.map((dev) => (
            <motion.div 
              key={dev.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="device-card-v3"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: dev.isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Monitor size={24} color={dev.isOnline ? '#22c55e' : '#64748b'} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{dev.hostname}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{dev.userEmail || "Unassigned"}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: dev.isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 700, color: dev.isOnline ? 'var(--green)' : 'var(--text3)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dev.isOnline ? 'var(--green)' : 'var(--text3)' }} />
                    {dev.isOnline ? "ONLINE" : "OFFLINE"}
                    
                    <button 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        if (window.confirm(`Remove device ${dev.hostname || dev.id}?`)) {
                          await deleteDoc(doc(db, "devices", dev.id));
                        }
                      }}
                      style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text3)'}
                      title="Remove Device"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                  <AppWindow size={16} color="var(--blue)" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700 }}>Current App</span>
                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dev.isOnline ? (dev.currentApp || "Productive Work") : "System Inactive"}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700 }}>Work Hours</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                      {Math.floor(dev.activeHours || 0)}h {Math.round(((dev.activeHours || 0) % 1) * 60)}m
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700 }}>Productivity</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22c55e' }}>{dev.productivityScore || 0}%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Keystrokes">
                      <Keyboard size={12} />
                      <span>{(dev.keystrokes || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Mouse Clicks">
                      <Mouse size={12} />
                      <span>{(dev.mouseClicks || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--blue)' }}>
                    {dev.typingSpeed || 0} WPM
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                  Last Active: {timeAgo(dev.lastSeen)}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button 
                  onClick={() => setSelectedDeviceId(dev.id)}
                  style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Eye size={14} /> Open Monitor
                </button>
                <button 
                  onClick={() => setShowAnalyticsFor(dev)}
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <BarChart3 size={14} /> Summary
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAnalyticsFor && (
          <AnalyticsDrawer user={showAnalyticsFor} onClose={() => setShowAnalyticsFor(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
