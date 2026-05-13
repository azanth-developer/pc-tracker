import { useState, useEffect } from "react";
import { useActivityData } from "../hooks/useActivityData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import DemoBanner from "../components/DemoBanner";
import { Cpu, MemoryStick, HardDrive, Wifi } from "lucide-react";

const API = "http://localhost:4000/api";

function GaugeRing({ pct, color, label, value }) {
  const r  = 42;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="gauge-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x="55" y="50" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="bold">{pct}%</text>
        <text x="55" y="67" textAnchor="middle" fill="#94a3b8" fontSize="10">{value}</text>
      </svg>
      <p className="gauge-label">{label}</p>
    </div>
  );
}

export default function SystemStats() {
  const { systemHistory, liveSystem, liveInfo, connected } = useActivityData();
  const [sysInfo, setSysInfo] = useState(null);

  useEffect(() => {
    async function loadSysInfo() {
      try {
        const res = await fetch(`${API}/system-info`);
        setSysInfo(await res.json());
      } catch {}
    }
    loadSysInfo();
  }, []);

  const totalRam = liveInfo?.totalRamGB || sysInfo?.totalRam?.replace(' GB','') || 8;
  const cpuPct = Math.round(liveSystem.cpu);
  const ramGb  = (liveSystem.ram || 0).toFixed(1);
  const ramPct = Math.round((liveSystem.ram / totalRam) * 100);

  return (
    <div className="page-content">
      <DemoBanner connected={connected} />

      <div className="page-header-row">
        <div>
          <h2 className="page-title">System Statistics</h2>
          <p className="page-desc">Real-time CPU, RAM and resource monitoring</p>
        </div>
        <div className="live-badge">
          <span className="live-dot" />
          Live
        </div>
      </div>

      {/* Gauges */}
      <div className="gauges-row">
        <div className="chart-card gauges-card">
          <h3 className="chart-title">Live Resource Usage</h3>
          <div className="gauges-flex">
            <GaugeRing pct={cpuPct} color="#6366f1" label="CPU Usage"    value={`${cpuPct}%`} />
            <GaugeRing pct={ramPct} color="#22d3ee" label="RAM Usage"    value={`${ramGb} GB`} />
            <GaugeRing pct={liveInfo?.network?.download > 0 ? Math.min(80, liveInfo.network.download) : 0} color="#a78bfa" label="Network ↓" value={`${liveInfo?.network?.download || 0} KB/s`} />
            <GaugeRing pct={liveInfo?.network?.upload > 0 ? Math.min(80, liveInfo.network.upload) : 0} color="#34d399" label="Network ↑" value={`${liveInfo?.network?.upload || 0} KB/s`} />
          </div>
        </div>

        {/* Real system info from API */}
        <div className="sys-info-grid">
          {[
            { icon: <Cpu       size={18} />, label: "Processor",    value: sysInfo?.cpuModel || liveInfo?.cpuModel || 'Loading...', color: "blue" },
            { icon: <MemoryStick size={18} />, label: "Total RAM",  value: sysInfo?.totalRam || (liveInfo?.totalRamGB ? `${liveInfo.totalRamGB} GB` : 'Loading...'), color: "cyan" },
            { icon: <HardDrive  size={18} />, label: "OS",          value: sysInfo?.os || `${liveInfo?.platform || ''} ${liveInfo?.arch || ''}`, color: "purple" },
            { icon: <Wifi       size={18} />, label: "Status",      value: connected ? `Connected — ${liveInfo?.hostname || ''}` : 'Disconnected', color: "green" },
          ].map(item => (
            <div key={item.label} className={`sys-info-card sys-info-${item.color}`}>
              <div className={`sys-info-icon sys-icon-${item.color}`}>{item.icon}</div>
              <div>
                <p className="sys-info-label">{item.label}</p>
                <p className="sys-info-value">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History chart */}
      <div className="chart-card">
        <h3 className="chart-title">Resource History (Last 20 samples)</h3>
        {systemHistory.length === 0 ? (
          <p className="chart-empty">No history data yet — data appears after ~15 seconds of monitoring</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={systemHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              />
              <Legend />
              <Line type="monotone" dataKey="cpu" name="CPU %"  stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ram" name="RAM %"  stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
