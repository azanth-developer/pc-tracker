import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDevices, useRunningApps } from "../hooks/useFirestoreData";
import { useActivityData } from "../hooks/useActivityData";
import {
  ListTodo, Cpu, MemoryStick, Clock, Search, Play, Pause,
  Monitor, ChevronDown, Activity, Layers, AppWindow,
} from "lucide-react";

const API = "http://localhost:4000/api";

export default function TaskManager() {
  const { devices, loading: devLoading } = useDevices();
  const { connected, liveInfo } = useActivityData();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("cpu");
  const [localProcesses, setLocalProcesses] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(false);

  // Get running apps for selected device from Firestore
  const deviceId = selectedDevice || (devices.length > 0 ? devices[0]?.id : null);
  const { apps: firestoreApps, loading: appsLoading } = useRunningApps(deviceId);

  // Fetch local processes from the monitor server
  useState(() => {
    async function fetchLocal() {
      setLoadingLocal(true);
      try {
        const res = await fetch(`${API}/processes`);
        if (res.ok) {
          const data = await res.json();
          setLocalProcesses(data);
        }
      } catch {}
      setLoadingLocal(false);
    }
    if (connected) fetchLocal();
    const t = setInterval(() => { if (connected) fetchLocal(); }, 10000);
    return () => clearInterval(t);
  });

  // Combine sources: Firestore running apps or local process data
  const processes = useMemo(() => {
    let list = firestoreApps.length > 0 ? firestoreApps : localProcesses;

    // If no data from either, show mock data structure
    if (list.length === 0 && connected && liveInfo?.currentApp) {
      list = [{
        name: liveInfo.currentApp,
        cpu: liveInfo.cpu || 0,
        memory: liveInfo.ramGB || 0,
        memPercent: liveInfo.ramPercent || 0,
        status: "Running",
        startTime: liveInfo.sessionStart || new Date().toISOString(),
        pid: "--",
      }];
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => (p.name || "").toLowerCase().includes(q));
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "name": return (a.name || "").localeCompare(b.name || "");
        case "cpu": return (b.cpu || 0) - (a.cpu || 0);
        case "memory": return (b.memPercent || b.memory || 0) - (a.memPercent || a.memory || 0);
        case "status": return (a.status || "").localeCompare(b.status || "");
        default: return 0;
      }
    });

    return list;
  }, [firestoreApps, localProcesses, searchQuery, sortBy, connected, liveInfo]);

  const totalCpu = processes.reduce((a, p) => a + (p.cpu || 0), 0);
  const totalMem = processes.reduce((a, p) => a + (p.memPercent || 0), 0);
  const running = processes.filter(p => (p.status || "Running") === "Running").length;

  const loading = devLoading || appsLoading;

  return (
    <div className="page-content">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Task Manager</h2>
          <p className="page-desc">View running processes across monitored devices</p>
        </div>
        <div className="live-badge">
          <span className="live-dot" />
          {processes.length} Processes
        </div>
      </div>

      {/* Summary Cards */}
      <div className="tm-summary">
        <motion.div className="tm-card tm-blue" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="tm-card-icon"><Cpu size={20} /></div>
          <div>
            <p className="tm-card-value">{Math.min(100, Math.round(totalCpu))}%</p>
            <p className="tm-card-label">Total CPU Usage</p>
          </div>
        </motion.div>
        <motion.div className="tm-card tm-cyan" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="tm-card-icon"><MemoryStick size={20} /></div>
          <div>
            <p className="tm-card-value">{Math.min(100, Math.round(totalMem))}%</p>
            <p className="tm-card-label">Memory Usage</p>
          </div>
        </motion.div>
        <motion.div className="tm-card tm-green" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="tm-card-icon"><Play size={20} /></div>
          <div>
            <p className="tm-card-value">{running}</p>
            <p className="tm-card-label">Running</p>
          </div>
        </motion.div>
        <motion.div className="tm-card tm-purple" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="tm-card-icon"><Layers size={20} /></div>
          <div>
            <p className="tm-card-value">{processes.length}</p>
            <p className="tm-card-label">Total Processes</p>
          </div>
        </motion.div>
      </div>

      {/* Device Selector & Filters */}
      <motion.div
        className="filters-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {devices.length > 0 && (
          <div className="filter-group">
            <Monitor size={14} />
            <select
              value={selectedDevice || ""}
              onChange={e => setSelectedDevice(e.target.value || null)}
            >
              <option value="">All Devices</option>
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.hostname || d.id} {d.isOnline ? "(Online)" : "(Offline)"}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="filter-search">
          <Search size={14} />
          <input
            placeholder="Search processes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <ChevronDown size={14} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="cpu">Sort by CPU</option>
            <option value="memory">Sort by Memory</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </motion.div>

      {/* Process Table */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        {loading ? (
          <div className="page-loading" style={{ height: "200px" }}>
            <div className="page-spinner" />
            <p>Loading processes...</p>
          </div>
        ) : processes.length === 0 ? (
          <div className="screenshot-empty">
            <ListTodo size={48} />
            <p>No process data available</p>
            <p className="page-desc">
              Run <code>npm run monitor</code> to collect process data, or ensure the agent is syncing to Firebase.
            </p>
          </div>
        ) : (
          <div className="report-table-wrap" style={{ maxHeight: "600px", overflowY: "auto" }}>
            <table className="report-table tm-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Application</th>
                  <th onClick={() => setSortBy("cpu")} className="th-sort">CPU %</th>
                  <th onClick={() => setSortBy("memory")} className="th-sort">Memory</th>
                  <th>PID</th>
                  <th>Start Time</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {processes.map((proc, i) => {
                    const cpuPct = Math.min(100, Math.round(proc.cpu || 0));
                    const memPct = Math.min(100, Math.round(proc.memPercent || 0));
                    const status = proc.status || "Running";
                    const startTime = proc.startTime
                      ? new Date(proc.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "--";

                    return (
                      <motion.tr
                        key={`${proc.name}-${proc.pid || i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <td>
                          <span className={`tm-status ${status === "Running" ? "tm-running" : "tm-suspended"}`}>
                            {status === "Running" ? <Play size={10} /> : <Pause size={10} />}
                            {status}
                          </span>
                        </td>
                        <td>
                          <div className="tm-app-name">
                            <AppWindow size={14} />
                            <span>{proc.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="tm-gauge">
                            <span className={cpuPct > 80 ? "tm-high" : ""}>{cpuPct}%</span>
                            <div className="tm-gauge-bar">
                              <div
                                className={`tm-gauge-fill ${cpuPct > 80 ? "tm-fill-red" : cpuPct > 50 ? "tm-fill-orange" : "tm-fill-blue"}`}
                                style={{ width: `${cpuPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="tm-gauge">
                            <span>{proc.memory ? `${proc.memory} MB` : `${memPct}%`}</span>
                            <div className="tm-gauge-bar">
                              <div
                                className={`tm-gauge-fill ${memPct > 80 ? "tm-fill-red" : "tm-fill-cyan"}`}
                                style={{ width: `${memPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="td-time">{proc.pid || "--"}</td>
                        <td className="td-time">{startTime}</td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
