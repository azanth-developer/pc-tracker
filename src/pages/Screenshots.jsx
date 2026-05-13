import { useState, useEffect } from "react";
import DemoBanner from "../components/DemoBanner";
import { useActivityData } from "../hooks/useActivityData";
import { Camera, RefreshCw, Image } from "lucide-react";

const API = "http://localhost:4000/api";

export default function Screenshots() {
  const { connected } = useActivityData();
  const [screenshots, setScreenshots] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  async function load() {
    try { const res = await fetch(`${API}/screenshots`); setScreenshots(await res.json()); } catch {}
  }

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  async function captureNow() {
    setCapturing(true);
    try { await fetch(`${API}/screenshot`, { method: 'POST' }); await load(); } catch {}
    setCapturing(false);
  }

  return (
    <div className="page-content">
      <DemoBanner connected={connected} />

      <div className="page-header-row">
        <div>
          <h2 className="page-title">Screenshots</h2>
          <p className="page-desc">Periodic screen captures (every 10 minutes)</p>
        </div>
        <button className="btn-primary" onClick={captureNow} disabled={capturing}>
          {capturing ? <><RefreshCw size={14} className="spin-icon" /> Capturing...</> : <><Camera size={14} /> Capture Now</>}
        </button>
      </div>

      {screenshots.length === 0 ? (
        <div className="chart-card">
          <div className="screenshot-empty">
            <Image size={48} />
            <p>No screenshots captured yet</p>
            <p className="page-desc">Screenshots auto-capture every 10 minutes, or click "Capture Now"</p>
          </div>
        </div>
      ) : (
        <div className="screenshot-grid">
          {screenshots.map((s, i) => (
            <div key={i} className="screenshot-card" onClick={() => setSelectedImg(s)}>
              <img src={`${API}/screenshot/${s.filename}`} alt={`Screenshot ${i + 1}`} loading="lazy" />
              <div className="sc-info">
                <p className="sc-time">{new Date(s.timestamp).toLocaleTimeString()}</p>
                <p className="sc-date">{new Date(s.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImg && (
        <div className="lightbox" onClick={() => setSelectedImg(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={`${API}/screenshot/${selectedImg.filename}`} alt="Screenshot" />
            <p className="lb-time">{new Date(selectedImg.timestamp).toLocaleString()}</p>
            <button className="lb-close" onClick={() => setSelectedImg(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
