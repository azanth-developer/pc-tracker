import React from "react";
import { motion } from "framer-motion";
import { useConsolidatedData } from "../hooks/useConsolidatedData";
import { 
  FileText, Download, FileSpreadsheet, 
  Calendar, Users, Clock, Shield, Search, Filter,
  Share2, Archive, CheckCircle2, Clock3
} from "lucide-react";

export default function Reports() {
  const { loading } = useConsolidatedData();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p>Compiling Enterprise Dossiers...</p>
      </div>
    );
  }

  const reports = [
    { id: 1, title: "Monthly Attendance Ledger", type: "Attendance", date: "May 2026", format: "PDF/XLSX", status: "Generated" },
    { id: 2, title: "Behavioral Productivity Audit", type: "Productivity", date: "Q2 2026", format: "PDF", status: "In Progress" },
    { id: 3, title: "Endpoint Resource Diagnostic", type: "Hardware", date: "Weekly", format: "CSV/JSON", status: "Automated" },
    { id: 4, title: "Security & System Access Logs", type: "Security", date: "Real-time", format: "PDF", status: "Ready" },
    { id: 5, title: "Individual Performance Dossier", type: "Personnel", date: "Custom", format: "XLSX", status: "Ready" },
  ];

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Compliance & Operational Reports</h2>
          <p className="page-desc">Generate, schedule, and archive critical organizational intelligence data.</p>
        </div>
        <button className="btn-primary">
          <Calendar size={18} /> Automate Dispatch
        </button>
      </div>

      <div className="stats-grid">
        {[
          { title: "Attendance Insights", desc: "Granular login/logout temporal mapping and presence logs.", icon: Calendar, color: "var(--success)" },
          { title: "Productivity Metrics", desc: "Efficiency scoring, idle-time analytics, and app usage data.", icon: FileText, color: "var(--blue)" },
          { title: "Security Protocols", desc: "Endpoint health diagnostics and administrative access logs.", icon: Shield, color: "#a855f7" },
        ].map((report, i) => (
          <motion.div key={i} whileHover={{ y: -8 }} className="chart-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: `${report.color}15`, color: report.color, width: "56px", height: "56px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 20px ${report.color}10` }}>
              <report.icon size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>{report.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text3)", marginTop: "0.5rem", lineHeight: 1.6 }}>{report.desc}</p>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button className="btn-primary" style={{ flex: 1, fontSize: "0.8rem" }}>
                <Download size={16} /> Export PDF
              </button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: "0.8rem", padding: "0" }}>
                <FileSpreadsheet size={16} /> XLSX
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="chart-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Archive size={20} className="text-blue" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>Historical Archive</h3>
          </div>
          
          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="search-input-wrap" style={{ minWidth: "260px" }}>
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Locate archived dossiers..." className="search-input" />
            </div>
            <button className="header-icon-btn"><Filter size={18} /></button>
          </div>
        </div>
        
        <div className="data-table-container" style={{ border: "none", borderRadius: 0 }}>
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dossier Identity</th>
                  <th>Classification</th>
                  <th>Temporal Scope</th>
                  <th>Format</th>
                  <th>Validation Status</th>
                  <th style={{ textAlign: "right" }}>Access</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td><p style={{ fontWeight: 800, color: "#fff" }}>{r.title}</p></td>
                    <td>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--blue)", background: "rgba(99,102,241,0.1)", padding: "0.4rem 0.75rem", borderRadius: "8px", textTransform: "uppercase" }}>{r.type}</span>
                    </td>
                    <td><span style={{ fontSize: "0.85rem", color: "var(--text3)", fontWeight: 600 }}>{r.date}</span></td>
                    <td><span style={{ fontSize: "0.85rem", color: "var(--text2)", fontWeight: 700 }}>{r.format}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: r.status === "Ready" || r.status === "Generated" ? "var(--success)" : "var(--warning)", fontSize: "0.85rem", fontWeight: 800 }}>
                        {r.status === "Generated" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                        {r.status.toUpperCase()}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="header-icon-btn" style={{ background: "var(--blue)", color: "#fff", border: "none" }} title="Download Secure Dossier">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
