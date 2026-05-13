import { useState, useEffect } from "react";
import DemoBanner from "../components/DemoBanner";
import { useActivityData } from "../hooks/useActivityData";
import { Usb, HardDrive, Wifi, FolderOpen, Download, AlertCircle } from "lucide-react";

const API = "http://localhost:4000/api";

export default function DeviceTracking() {
  const { connected } = useActivityData();
  const [devices, setDevices] = useState({ usb: [], disks: [], network: [] });
  const [files, setFiles] = useState([]);
  const [usbEvents, setUsbEvents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [devRes, fileRes, usbRes] = await Promise.all([
          fetch(`${API}/devices`), fetch(`${API}/files`), fetch(`${API}/usb`),
        ]);
        setDevices(await devRes.json());
        setFiles(await fileRes.json());
        setUsbEvents(await usbRes.json());
      } catch {}
    }
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page-content">
      <DemoBanner connected={connected} />
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Device & File Tracking</h2>
          <p className="page-desc">USB devices, storage, network interfaces, and file activity</p>
        </div>
      </div>

      <div className="charts-grid">
        {/* USB Devices */}
        <div className="chart-card">
          <h3 className="chart-title"><Usb size={15} style={{ display: 'inline', marginRight: 6 }} />USB Devices</h3>
          {devices.usb.length === 0 ? (
            <p className="chart-empty">No USB devices detected</p>
          ) : (
            <div className="device-list">
              {devices.usb.map((d, i) => (
                <div key={i} className="device-item">
                  <Usb size={14} />
                  <div>
                    <p className="di-name">{d.name || 'Unknown Device'}</p>
                    <p className="di-meta">{d.type || 'USB'} {d.removable ? '• Removable' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disks */}
        <div className="chart-card">
          <h3 className="chart-title"><HardDrive size={15} style={{ display: 'inline', marginRight: 6 }} />Storage Drives</h3>
          {devices.disks.length === 0 ? (
            <p className="chart-empty">No disk info available</p>
          ) : (
            <div className="device-list">
              {devices.disks.map((d, i) => (
                <div key={i} className="device-item">
                  <HardDrive size={14} />
                  <div>
                    <p className="di-name">{d.vendor} {d.name}</p>
                    <p className="di-meta">{d.size} • {d.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Network */}
        <div className="chart-card">
          <h3 className="chart-title"><Wifi size={15} style={{ display: 'inline', marginRight: 6 }} />Network Interfaces</h3>
          {devices.network.length === 0 ? (
            <p className="chart-empty">No network info available</p>
          ) : (
            <div className="device-list">
              {devices.network.map((n, i) => (
                <div key={i} className="device-item">
                  <Wifi size={14} />
                  <div>
                    <p className="di-name">{n.iface}</p>
                    <p className="di-meta">{n.ip4} • {n.speed} Mbps • {n.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* USB Events */}
      <div className="chart-card">
        <h3 className="chart-title">USB Connection Events</h3>
        {usbEvents.length === 0 ? (
          <p className="chart-empty">No USB events recorded yet</p>
        ) : (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead><tr><th>Time</th><th>Device</th><th>Event</th></tr></thead>
              <tbody>
                {usbEvents.map((e, i) => (
                  <tr key={i}>
                    <td className="td-time">{new Date(e.timestamp).toLocaleTimeString()}</td>
                    <td className="td-app">{e.name}</td>
                    <td><span className={`status-badge ${e.event === 'connected' ? 'status-green' : 'status-red'}`}>
                      {e.event === 'connected' ? '🔌 Connected' : '⏏️ Removed'}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File Activity */}
      <div className="chart-card">
        <h3 className="chart-title"><FolderOpen size={15} style={{ display: 'inline', marginRight: 6 }} />Recent File Activity (Downloads)</h3>
        {files.length === 0 ? (
          <p className="chart-empty">No file activity recorded — monitoring Downloads folder</p>
        ) : (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead><tr><th>Time</th><th>File</th><th>Event</th></tr></thead>
              <tbody>
                {files.slice(0, 20).map((f, i) => (
                  <tr key={i}>
                    <td className="td-time">{new Date(f.timestamp).toLocaleTimeString()}</td>
                    <td className="td-app">{f.filename}</td>
                    <td><span className="status-badge status-cyan"><Download size={12} /> {f.event}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
