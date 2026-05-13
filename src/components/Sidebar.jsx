import {
  LayoutDashboard, FileText, Calendar, Cpu, Settings,
  Monitor, ChevronLeft, ChevronRight, LogOut, Eye,
  Laptop, BarChart3, Shield,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const NAV_ADMIN = [
  { id: "dashboard",   label: "Dashboard",       icon: <LayoutDashboard size={18} /> },
  { id: "alldevices",  label: "All Devices",      icon: <Laptop          size={18} /> },
  { id: "attendance",  label: "Attendance",       icon: <Calendar        size={18} /> },
  { id: "settings",    label: "Settings",         icon: <Settings        size={18} /> },
];

const NAV_EMPLOYEE = [
  { id: "dashboard",   label: "My Dashboard",     icon: <LayoutDashboard size={18} /> },
  { id: "analytics",   label: "My Analytics",     icon: <BarChart3       size={18} /> },
  { id: "attendance",  label: "Attendance",        icon: <Calendar        size={18} /> },
  { id: "settings",    label: "Settings",          icon: <Settings        size={18} /> },
];

export default function Sidebar({ activePage, setActivePage, open, setOpen }) {
  const { logout, isAdmin, userProfile } = useAuth();
  const NAV = isAdmin ? NAV_ADMIN : NAV_EMPLOYEE;

  return (
    <aside className={`sidebar${open ? "" : " sidebar-closed"}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo"><Monitor size={20} /></div>
        {open && <span className="sidebar-brand-text">PC Tracker</span>}
        <button className="sidebar-toggle" onClick={() => setOpen(o => !o)} title={open ? "Collapse" : "Expand"}>
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {open && (
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            {(userProfile?.displayName || "A")[0].toUpperCase()}
          </div>
          <div className="sidebar-user-details">
            <p className="sidebar-user-name">{userProfile?.displayName || "User"}</p>
            <p className="sidebar-user-role">
              {isAdmin ? <><Shield size={10} /> Admin</> : "Employee"}
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
