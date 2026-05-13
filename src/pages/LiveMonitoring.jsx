import { useState } from "react";
import { motion } from "framer-motion";
import { useDevices } from "../hooks/useFirestoreData";
import { useActivityData } from "../hooks/useActivityData";
import { Monitor, Keyboard, Mouse, Clock, Wifi, WifiOff, Activity, AppWindow, Cpu, MemoryStick } from "lucide-react";

export default function LiveMonitoring({ deviceId: propDeviceId }) {
  const { devices, online } = useDevices();
  const { liveInfo, connected, appUsage } = useActivityData();
  const [selectedDevice, setSelectedDevice] = useState(null);

  // If propDeviceId is passed, we lock to that. Otherwise use selector or first online.
  const targetId = propDeviceId || selectedDevice;

  const dev = targetId
    ? devices.find(d => d.id === targetId) || {}
    : (devices.find(d => d.isOnline) || {});

  const info = dev.id ? {
    currentApp: dev.currentApp || "Desktop",
    currentTitle: dev.currentTitle || "No active window",
    cpu: dev.cpu || 0,
    ramGB: dev.ramGB || 0,
    ramPercent: dev.ramPercent || 0,
    keystrokes: dev.keystrokes || 0,
    mouseClicks: dev.mouseClicks || 0,
    uptimeMinutes: dev.uptimeMinutes || 0,
    hostname: dev.hostname || dev.id,
    userEmail: dev.userEmail || "",
    cpuModel: dev.cpuModel || "",
    cpuCores: dev.cpuCores || 0,
    totalRamGB: dev.totalRamGB || 0,
    idleSeconds: dev.idleSeconds || 0,
    isIdle: (dev.idleSeconds || 0) > 300,
    isOnline: dev.isOnline,
    network: { download: dev.networkDownload || 0, upload: dev.networkUpload || 0 },
    loginTime: dev.lastSeen ? new Date(dev.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--",
    osUptime: 0,
    bootTime: null,
  } : (liveInfo || {});

  const isActive = dev.id ? dev.isOnline : connected;

  return (
    <div className={propDeviceId ? "monitor-detail-embed" : "page-content"}>
      {!propDeviceId && (
        <div className="page-header-row">
          <div>
            <h2 className="page-title">Live Monitoring</h2>
            <p className="page-desc">Real-time view of system activity</p>
          </div>
          <div className="header-controls">
            {devices.length > 0 && (
              <select
                className="device-selector"
                value={selectedDevice || ""}
                onChange={e => setSelectedDevice(e.target.value || null)}
              >
                <option value="">Auto (First Online)</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.hostname || d.id} {d.isOnline ? "(Online)" : "(Offline)"}
                  </option>
                ))}
              </select>
            )}
            <div className={`live-badge ${info.isIdle ? "live-badge-idle" : ""}`}>
              <span className="live-dot" />
              {info.isIdle ? "Idle" : isActive ? "Active" : "Offline"}
            </div>
          </div>
        </div>
      )}

      {/* Current App */}
      <motion.div
        className="live-current-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="live-current-icon"><AppWindow size={28} /></div>
        <div>
          <p className="live-current-app">{info.currentApp || "Desktop"}</p>
          <p className="live-current-title">{(info.currentTitle || "No active window").slice(0, 80)}</p>
        </div>
        <div className="live-current-time">
          <Clock size={14} />
          {info.uptimeMinutes || 0}m session
        </div>
      </motion.div>

      {/* Live Metrics Grid */}
      <div className="live-metrics-grid">
        {[
          { icon: <Cpu size={20} />, value: `${info.cpu || 0}%`, label: "CPU Usage", cls: "lm-blue", bar: true, pct: info.cpu || 0, fillCls: "lm-fill-blue" },
          { icon: <MemoryStick size={20} />, value: `${info.ramGB || 0} GB`, label: `RAM (${info.ramPercent || 0}%)`, cls: "lm-cyan", bar: true, pct: info.ramPercent || 0, fillCls: "lm-fill-cyan" },
          { icon: <Keyboard size={20} />, value: (info.keystrokes || 0).toLocaleString(), label: "Keystrokes", cls: "lm-purple" },
          { icon: <Mouse size={20} />, value: (info.mouseClicks || 0).toLocaleString(), label: "Mouse Clicks", cls: "lm-orange" },
          { icon: <Wifi size={20} />, value: `${info.network?.download || 0} KB/s`, label: "Download", cls: "lm-green" },
          { icon: <Wifi size={20} />, value: `${info.network?.upload || 0} KB/s`, label: "Upload", cls: "lm-pink" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className="live-metric-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <div className={`lm-icon ${m.cls}`}>{m.icon}</div>
            <div className="lm-data">
              <p className="lm-value">{m.value}</p>
              <p className="lm-label">{m.label}</p>
            </div>
            {m.bar && (
              <div className="lm-bar">
                <motion.div
                  className={`lm-bar-fill ${m.fillCls}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.pct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Machine Details */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="chart-title">Machine Details</h3>
        <div className="sys-details-grid">
          {[
            { label: "Hostname", value: info.hostname },
            { label: "CPU", value: info.cpuModel },
            { label: "Cores", value: info.cpuCores },
            { label: "Total RAM", value: info.totalRamGB ? `${info.totalRamGB} GB` : "--" },
            { label: "Idle", value: `${info.idleSeconds || 0}s` },
            { label: "Session", value: info.loginTime || "--" },
          ].map(item => (
            <div key={item.label} className="sys-detail-item">
              <span className="sd-label">{item.label}</span>
              <span className="sd-value">{item.value || "--"}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Apps */}
      {(appUsage || []).length > 0 && (
        <motion.div
          className="chart-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="chart-title">App Usage Today (Top 10)</h3>
          <div className="live-apps-list">
            {(appUsage || []).slice(0, 10).map((app, i) => {
              const max = appUsage[0]?.activeTime || 1;
              const pct = Math.round((app.activeTime / max) * 100);
              const h = Math.floor(app.activeTime / 3600);
              const m = Math.floor((app.activeTime % 3600) / 60);
              return (
                <motion.div
                  key={app.appName}
                  className="live-app-row"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.03 }}
                >
                  <span className="lar-rank">#{i + 1}</span>
                  <span className="lar-name">{app.appName}</span>
                  <div className="lar-bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                  <span className="lar-time">{h > 0 ? `${h}h ${m}m` : `${m}m`}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
