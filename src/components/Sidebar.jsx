import {
  LayoutDashboard, FileText, Calendar, Cpu, Settings,
  Monitor, ChevronLeft, ChevronRight, LogOut, Eye,
  Laptop, BarChart3, Shield, Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const NAV_ADMIN = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "employees", label: "Employees", icon: <Users size={18} /> },
  { id: "attendance", label: "Attendance", icon: <Calendar size={18} /> },
  { id: "devices", label: "Devices", icon: <Laptop size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

const NAV_EMPLOYEE = [
  { id: "dashboard", label: "My Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "attendance", label: "Attendance", icon: <Calendar size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function Sidebar({ activePage, setActivePage, open, setOpen }) {
  const { logout, isAdmin, userProfile } = useAuth();
  const NAV = isAdmin ? NAV_ADMIN : NAV_EMPLOYEE;

  return (
    <aside className={`sidebar${open ? "" : " sidebar-closed"}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo"><Monitor size={20} /></div>
        {open && <span className="sidebar-brand-text">Employee Attendance</span>}
        <button className="sidebar-toggle" onClick={() => setOpen(o => !o)} title={open ? "Collapse" : "Expand"}>
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {open && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.25rem 1rem", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, flexShrink: 0 }}>
            {(userProfile?.displayName || "A")[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)" }}>
              {userProfile?.displayName || "Admin"}
            </p>
            <p className="truncate" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {isAdmin ? "Administrator" : "Employee"}
            </p>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`sidebar-nav-item${activePage === item.id ? " active" : ""}`}
            onClick={() => setActivePage(item.id)}
            title={!open ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {open && <span className="nav-label">{item.label}</span>}
            {activePage === item.id && <span className="nav-active-bar" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button id="btn-logout" className="sidebar-logout" onClick={logout} title="Logout">
          <LogOut size={17} />
          {open && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
