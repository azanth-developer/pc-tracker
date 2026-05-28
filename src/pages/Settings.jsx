import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Save, RefreshCcw, Shield } from "lucide-react";

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Shift Configuration</h2>
          <p className="page-desc">Set standard working hours and time zones for your employees.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-secondary">
            <RefreshCcw size={18} /> Rollback
          </button>
          <div style={{ position: "relative" }}>
            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <RefreshCcw size={18} className="animate-spin" /> Committing...
                </span>
              ) : (
                <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <Save size={18} /> Commit Changes
                </span>
              )}
            </button>
            {/* Success Toast */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: "absolute", top: "115%", right: 0, background: "var(--success-bg)",
                    color: "var(--success)", border: "1px solid rgba(34,197,94,0.3)",
                    padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem",
                    fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem",
                    whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(34,197,94,0.15)"
                  }}
                >
                  <Shield size={14} /> ✔ Settings Updated Successfully
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "800px" }}>
        <div className="chart-card" style={{ padding: "2.5rem" }}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "0.75rem", borderRadius: "12px", color: "var(--success)" }}>
                  <Clock size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Shift Timing</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text3)" }}>Standard working hours for your employees.</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem" }}>
                <div className="search-input-wrap">
                  <p className="stat-label" style={{ marginBottom: "0.5rem" }}>Time Zone</p>
                  <select className="search-input" style={{ paddingLeft: "1.25rem", cursor: "pointer", appearance: "none" }} defaultValue="UTC-05:00">
                    <option value="UTC-12:00">UTC-12:00 (International Date Line West)</option>
                    <option value="UTC-11:00">UTC-11:00 (Samoa, Midway Island)</option>
                    <option value="UTC-10:00">UTC-10:00 (Hawaii-Aleutian)</option>
                    <option value="UTC-09:00">UTC-09:00 (Alaska)</option>
                    <option value="UTC-08:00">UTC-08:00 (Pacific Time - US & Canada)</option>
                    <option value="UTC-07:00">UTC-07:00 (Mountain Time - US & Canada)</option>
                    <option value="UTC-06:00">UTC-06:00 (Central Time - US & Canada)</option>
                    <option value="UTC-05:00">UTC-05:00 (Eastern Time - US & Canada)</option>
                    <option value="UTC-04:00">UTC-04:00 (Atlantic Time - Canada)</option>
                    <option value="UTC-03:00">UTC-03:00 (Buenos Aires, Brasilia)</option>
                    <option value="UTC-02:00">UTC-02:00 (Mid-Atlantic)</option>
                    <option value="UTC-01:00">UTC-01:00 (Azores, Cape Verde Is.)</option>
                    <option value="UTC+00:00">UTC+00:00 (London, Dublin, Lisbon)</option>
                    <option value="UTC+01:00">UTC+01:00 (Berlin, Rome, Paris)</option>
                    <option value="UTC+02:00">UTC+02:00 (Cairo, Jerusalem, Athens)</option>
                    <option value="UTC+03:00">UTC+03:00 (Moscow, Riyadh, Baghdad)</option>
                    <option value="UTC+04:00">UTC+04:00 (Dubai, Baku, Tbilisi)</option>
                    <option value="UTC+05:00">UTC+05:00 (Karachi, Tashkent)</option>
                    <option value="UTC+05:30">UTC+05:30 (India, Sri Lanka)</option>
                    <option value="UTC+06:00">UTC+06:00 (Dhaka, Almaty)</option>
                    <option value="UTC+07:00">UTC+07:00 (Bangkok, Hanoi, Jakarta)</option>
                    <option value="UTC+08:00">UTC+08:00 (Beijing, Singapore, Perth)</option>
                    <option value="UTC+09:00">UTC+09:00 (Tokyo, Seoul)</option>
                    <option value="UTC+10:00">UTC+10:00 (Sydney, Melbourne, Guam)</option>
                    <option value="UTC+11:00">UTC+11:00 (Solomon Is., New Caledonia)</option>
                    <option value="UTC+12:00">UTC+12:00 (Fiji, Auckland, Wellington)</option>
                  </select>
                  <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-10%)", pointerEvents: "none", color: "var(--text-muted)" }}>
                    ▼
                  </div>
                </div>
                <div className="search-input-wrap">
                  <p className="stat-label" style={{ marginBottom: "0.5rem" }}>Shift Start</p>
                  <input className="search-input" style={{ paddingLeft: "1.25rem" }} defaultValue="09:00:00" />
                </div>
                <div className="search-input-wrap">
                  <p className="stat-label" style={{ marginBottom: "0.5rem" }}>Shift End</p>
                  <input className="search-input" style={{ paddingLeft: "1.25rem" }} defaultValue="18:00:00" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
