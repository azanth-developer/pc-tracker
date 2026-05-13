import { useState } from "react";
import { useDevices } from "../hooks/useFirestoreData";
import AnalyticsDrawer from "../components/AnalyticsDrawer";
import { Calendar, Clock, LogIn, LogOut, CheckCircle, AlertCircle, Minus, ChevronRight, Search, Trash2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Attendance() {
  const { devices, total, online, loading } = useDevices();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (devices || []).filter(d => 
    (d.displayName || d.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Attendance Tracking</h2>
          <p className="page-desc">Real-time attendance logs and employee session monitoring</p>
        </div>
        
        <div className="search-box" style={{ background: 'var(--bg2)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={16} color="var(--text3)" />
          <input 
            type="text" 
            placeholder="Search employee..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', outline: 'none', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="attendance-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="att-badge att-green" style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle size={24} color="#22c55e" />
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{online}</p>
            <p style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>Currently Present</p>
          </div>
        </div>
        <div className="att-badge att-blue" style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Clock size={24} color="#818cf8" />
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{total - online}</p>
            <p style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>Offline / Absent</p>
          </div>
        </div>
        <div className="att-badge att-slate" style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Calendar size={24} color="#94a3b8" />
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{total}</p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Total Registered</p>
          </div>
        </div>
      </div>

      <div className="chart-card" style={{ background: 'var(--bg2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h3 className="chart-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={18} /> Employee Attendance Registry
        </h3>
        
        <div className="report-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text3)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ padding: '1rem', color: 'var(--text3)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Work Hours</th>
                <th style={{ padding: '1rem', color: 'var(--text3)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Activity (K/M)</th>
                <th style={{ padding: '1rem', color: 'var(--text3)', fontSize: '0.75rem', textTransform: 'uppercase' }}>WPM</th>
                <th style={{ padding: '1rem', color: 'var(--text3)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text3)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Last Seen</th>
                <th style={{ padding: '1rem', color: 'var(--text3)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const hours = user.activeHours || 0;
                const attendanceStatus = hours >= 8 ? "Present" : hours >= 4 ? "Half Day" : "Absent";
                const attendanceColor = hours >= 8 ? "#22c55e" : hours >= 4 ? "#6366f1" : "#ef4444";
                
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                          {(user.displayName || user.fullName || user.userName || user.name || user.userEmail || "U")?.[0]}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{user.displayName || user.fullName || user.userName || user.name || user.userEmail}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{user.userEmail || user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                      {Math.floor(hours)}h {Math.round((hours % 1) * 60)}m
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text2)' }}>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <span title="Keystrokes">{user.keystrokes || 0}K</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span title="Mouse Clicks">{user.mouseClicks || 0}M</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#6366f1' }}>
                      {user.typingSpeed || 0}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, color: attendanceColor, background: `${attendanceColor}15` }}>
                        {attendanceStatus.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
                      {user.lastSeen ? new Date(user.lastSeen).toLocaleTimeString() : "Never"}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => setSelectedUser(user)}
                          style={{ background: '#334155', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Summary
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Remove ${user.displayName}?`)) {
                              await deleteDoc(doc(db, "users", user.id));
                            }
                          }}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
const LayoutDashboard = ({ size }) => <LayoutDashboardIcon size={size} />;
import { LayoutDashboard as LayoutDashboardIcon } from "lucide-react";
