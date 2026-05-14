import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings as SettingsIcon, Shield, Bell, 
  Monitor, Lock, Eye, Database, 
  Clock, Save, RefreshCcw, UserPlus,
  Cpu, HardDrive, Layout, Fingerprint
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  const sections = [
    { id: "general", label: "Core Identity", icon: SettingsIcon },
    { id: "monitoring", label: "Telemetry Matrix", icon: Eye },
    { id: "permissions", label: "Access Security", icon: Shield },
    { id: "notifications", label: "Alert Configuration", icon: Bell },
    { id: "storage", label: "Cloud Synchronization", icon: Database },
  ];

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Platform Configuration</h2>
          <p className="page-desc">High-level administrative override for organizational telemetry and security protocols.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-secondary">
            <RefreshCcw size={18} /> Rollback
          </button>
          <button className="btn-primary">
            <Save size={18} /> Commit Changes
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2.5rem" }}>
        {/* Sidebar Tabs */}
        <div className="chart-card" style={{ padding: "0.75rem", alignSelf: "start" }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`sidebar-nav-item ${activeTab === section.id ? "active" : ""}`}
              style={{ marginBottom: "0.25rem", padding: "1rem" }}
            >
              <div className="nav-icon"><section.icon size={20} /></div>
              <span className="nav-label" style={{ fontWeight: 700 }}>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="chart-card" style={{ padding: "2.5rem" }}>
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "0.75rem", borderRadius: "12px", color: "var(--blue)" }}>
                      <Layout size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Organization DNA</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text3)" }}>Global branding and structural identity markers.</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    <div className="search-input-wrap">
                      <p className="stat-label" style={{ marginBottom: "0.5rem" }}>Platform Alias</p>
                      <input className="search-input" style={{ paddingLeft: "1rem" }} defaultValue="Employee Attendance" />
                    </div>
                    <div className="search-input-wrap">
                      <p className="stat-label" style={{ marginBottom: "0.5rem" }}>Root URL</p>
                      <input className="search-input" style={{ paddingLeft: "1rem" }} defaultValue="https://enterprise.nexus.com" />
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: "2.5rem", borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "0.75rem", borderRadius: "12px", color: "var(--success)" }}>
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Operational Temporal Range</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text3)" }}>Standard shift parameters for automated attendance calculation.</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    <div className="search-input-wrap">
                      <p className="stat-label" style={{ marginBottom: "0.5rem" }}>Primary Shift Start</p>
                      <input className="search-input" style={{ paddingLeft: "1.25rem" }} defaultValue="09:00:00" />
                    </div>
                    <div className="search-input-wrap">
                      <p className="stat-label" style={{ marginBottom: "0.5rem" }}>Primary Shift End</p>
                      <input className="search-input" style={{ paddingLeft: "1.25rem" }} defaultValue="18:00:00" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "monitoring" && (
              <motion.div 
                key="monitoring"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "0.75rem", borderRadius: "12px", color: "var(--warning)" }}>
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Telemetry Resolution</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text3)" }}>Control the granularity of endpoint data extraction.</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    { label: "Intense Process Tracking", desc: "Log application window transitions with sub-second precision.", enabled: true, icon: Activity },
                    { label: "Predictive Screen Capture", desc: "Automated high-res snapshots based on behavioral anomalies.", enabled: false, icon: Monitor },
                    { label: "Input Vector Analysis", desc: "Aggregate keystroke cadence and mouse interaction patterns.", enabled: true, icon: Fingerprint },
                    { label: "System Health Telemetry", desc: "Continuous monitoring of CPU, RAM, and storage health.", enabled: true, icon: HardDrive },
                  ].map((item, i) => (
                    <div key={i} className="chart-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", background: "rgba(255,255,255,0.01)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        <div style={{ color: "var(--text3)" }}><item.icon size={22} /></div>
                        <div>
                          <p style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{item.label}</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text3)" }}>{item.desc}</p>
                        </div>
                      </div>
                      <div style={{ 
                        width: "52px", 
                        height: "28px", 
                        background: item.enabled ? "var(--blue)" : "var(--bg3)", 
                        borderRadius: "20px", 
                        position: "relative",
                        cursor: "pointer",
                        boxShadow: item.enabled ? "0 0 15px var(--blue-glow)" : "none"
                      }}>
                        <div style={{ 
                          width: "20px", 
                          height: "20px", 
                          background: "#fff", 
                          borderRadius: "50%", 
                          position: "absolute", 
                          top: "4px", 
                          left: item.enabled ? "28px" : "4px",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "permissions" && (
              <motion.div 
                key="permissions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ background: "rgba(168, 85, 247, 0.1)", padding: "0.75rem", borderRadius: "12px", color: "#a855f7" }}>
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Access & Authorization</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text3)" }}>Manage administrative clearance levels and security tokens.</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <button className="btn-primary" style={{ alignSelf: "flex-start", padding: "1rem 2rem" }}>
                    <UserPlus size={18} /> Provision Admin Clearances
                  </button>
                  
                  <div className="chart-card" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "1.5rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <Shield size={24} style={{ color: "var(--danger)" }} />
                      <div>
                        <p style={{ fontWeight: 800, color: "var(--danger)", fontSize: "0.95rem" }}>Security Alert: Multi-Factor Authentication (MFA) Standby</p>
                        <p style={{ fontSize: "0.8rem", color: "rgba(239, 68, 68, 0.8)", marginTop: "0.25rem" }}>Biometric and hardware security tokens are currently deactivated for this cluster.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
