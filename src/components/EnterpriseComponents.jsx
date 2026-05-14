import { motion } from "framer-motion";
import { Users, Zap, AppWindow, Clock, AlertCircle, Wifi, WifiOff, Keyboard, Mouse } from "lucide-react";

/**
 * Live activity feed component
 */
export function ActivityFeed({ sessions, activities, limit = 6 }) {
  // Create activity timeline from sessions and activities
  const timeline = [
    ...sessions.map((s) => ({
      type: "session",
      timestamp: s.startTime,
      user: s.user?.employeeName || "Unknown User",
      action: s.appName ? `opened ${s.appName}` : "session started",
      icon: AppWindow,
    })),
    ...activities.map((a) => ({
      type: "activity",
      timestamp: a.timestamp,
      user: a.user?.employeeName || "Unknown User",
      action: a.action || "activity logged",
      icon: Zap,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);

  if (timeline.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text3)" }}>
        No activity yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {timeline.map((item, idx) => {
        const Icon = item.icon;
        const timeago = getTimeAgo(new Date(item.timestamp));
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              display: "flex",
              gap: "1rem",
              padding: "1rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "12px",
              borderLeft: "2px solid #6366f1",
            }}
          >
            <div style={{ color: "#6366f1", flexShrink: 0 }}>
              <Icon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.9rem", color: "#fff", fontWeight: 600 }}>
                {item.user} <span style={{ color: "var(--text3)" }}>{item.action}</span>
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginTop: "0.25rem" }}>{timeago}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Employee leaderboard component
 */
export function ProductivityLeaderboard({ employees, limit = 5 }) {
  const topEmployees = (employees || [])
    .sort((a, b) => (b.productivityScore || 0) - (a.productivityScore || 0))
    .slice(0, limit);

  if (topEmployees.length === 0) {
    return <div style={{ padding: "2rem", color: "var(--text3)", textAlign: "center" }}>No employees yet</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {topEmployees.map((emp, idx) => (
        <motion.div
          key={emp.uid}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: `linear-gradient(135deg, #6366f1, #a855f7)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.75rem",
              flexShrink: 0,
            }}
          >
            {idx + 1}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
              {emp.employeeName || emp.displayName || "Unknown User"}
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text3)" }}>
              {emp.activeHours || 0}h · {emp.keystrokes || 0} keystrokes
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "1.125rem", fontWeight: 800, color: "#22c55e" }}>{emp.productivityScore || 0}%</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Device card for All Devices page
 */
export function DeviceCard({ device, onDelete, onDetails }) {
  const isOnline = device.isOnline;
  const productivity = device.productivityScore || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      style={{
        background: "var(--bg2)",
        border: `1px solid ${isOnline ? "rgba(34, 197, 94, 0.2)" : "var(--border)"}`,
        borderRadius: "16px",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Online indicator */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: isOnline ? "#22c55e" : "#6b7280",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.875rem", color: "var(--text3)", fontWeight: 600 }}>Employee</p>
          <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginTop: "0.25rem" }}>
            {device.employeeName || "Unknown User"}
          </p>
        </div>
        <div
          style={{
            background: isOnline ? "rgba(34, 197, 94, 0.1)" : "rgba(107, 114, 128, 0.1)",
            border: `1px solid ${isOnline ? "rgba(34, 197, 94, 0.3)" : "rgba(107, 114, 128, 0.3)"}`,
            color: isOnline ? "#22c55e" : "#6b7280",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            fontSize: "0.75rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>

      {/* Device Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--text3)", textTransform: "uppercase", fontWeight: 600 }}>Device</p>
          <p style={{ fontSize: "0.9rem", color: "#fff", marginTop: "0.5rem", fontWeight: 600 }}>
            {device.displayName || "Unknown Device"}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--text3)", textTransform: "uppercase", fontWeight: 600 }}>Current App</p>
          <p style={{ fontSize: "0.9rem", color: "#6366f1", marginTop: "0.5rem", fontWeight: 600 }}>
            {device.currentApp || "Idle"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 600 }}>PRODUCTIVITY</p>
          <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#22c55e", marginTop: "0.25rem" }}>
            {productivity}%
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 600 }}>KEYSTROKES</p>
          <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#3b82f6", marginTop: "0.25rem" }}>
            {(device.keystrokes || 0) / 1000}K
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 600 }}>CLICKS</p>
          <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#a855f7", marginTop: "0.25rem" }}>
            {(device.mouseClicks || 0) / 1000}K
          </p>
        </div>
      </div>

      {/* System Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div>
          <p style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 600 }}>CPU</p>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginTop: "0.25rem" }}>
            {device.cpuUsage || 0}%
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 600 }}>RAM</p>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginTop: "0.25rem" }}>
            {device.ramUsage || 0}%
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 600 }}>BATTERY</p>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginTop: "0.25rem" }}>
            {device.batteryLevel || 0}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={() => onDetails?.(device)}
          style={{
            flex: 1,
            background: "#6366f1",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Details
        </button>
        <button
          onClick={() => onDelete?.(device)}
          style={{
            flex: 1,
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Remove
        </button>
      </div>

      {/* Last Active */}
      <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginTop: "1rem", textAlign: "center" }}>
        Last seen: {getTimeAgo(new Date(device.lastSeen || Date.now()))}
      </p>
    </motion.div>
  );
}

function getTimeAgo(date) {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
