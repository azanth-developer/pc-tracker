import React from "react";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

/**
 * Modern Status Badge with simple styling
 */
export function StatusBadge({ status }) {
  const config = {
    online:  { class: "badge-online", icon: <CheckCircle size={14} />, label: "Online" },
    offline: { class: "badge-offline", icon: <XCircle size={14} />, label: "Offline" },
    busy:    { class: "badge-offline", icon: <AlertCircle size={14} />, label: "Busy" },
    idle:    { class: "badge-idle", icon: <Clock size={14} />, label: "Idle" },
    present: { class: "badge-online", icon: <CheckCircle size={14} />, label: "Present" },
    absent:  { class: "badge-offline", icon: <XCircle size={14} />, label: "Absent" },
  };

  const { class: className, icon, label } = config[status.toLowerCase()] || config.offline;

  return (
    <div className={`badge-pill ${className}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

/**
 * Simple User Avatar with Online Indicator
 */
export function UserAvatar({ user, size = 40 }) {
  const initials = (user?.employeeName || user?.email || "U")[0].toUpperCase();
  const isOnline = user?.isOnline;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div className="avatar-base" style={{ 
        width: size, 
        height: size, 
        fontSize: size * 0.4 
      }}>
        {initials}
      </div>
      {isOnline && (
        <div className="status-dot online" style={{ 
          position: "absolute", 
          bottom: 0, 
          right: 0, 
          width: size * 0.3, 
          height: size * 0.3,
          border: "2px solid var(--bg)"
        }} />
      )}
    </div>
  );
}

/**
 * Productivity Score Gauge (Mini, Flat)
 */
export function ProductivityScore({ score }) {
  const colorClass = score >= 80 ? "text-green" : score >= 50 ? "text-orange" : "text-red";
  const barColor = score >= 80 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--danger)";
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600 }} className={colorClass}>{score}%</span>
      </div>
      <div style={{ width: "100%", height: "6px", background: "var(--bg3)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: barColor, borderRadius: "3px" }} />
      </div>
    </div>
  );
}
