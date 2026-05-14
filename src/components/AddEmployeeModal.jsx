import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Briefcase, Hash, Shield, Target } from "lucide-react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function AddEmployeeModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeName: "",
    email: "",
    employeeId: "",
    department: "Engineering",
    role: "Senior Developer",
    productivityScore: 85
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uid = `emp_${Date.now()}`;
      await setDoc(doc(db, "users", uid), {
        ...form,
        isOnline: false,
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      console.error("Add error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "550px", border: "1px solid var(--border)", background: "var(--bg2)" }}
          >
            <div style={{ background: "var(--accent-gradient)", padding: "2.5rem", color: "#fff", position: "relative" }}>
              <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(0,0,0,0.2)", border: "none", color: "#fff", borderRadius: "10px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "0.75rem" }}>
                <div style={{ background: "rgba(255,255,255,0.2)", padding: "1rem", borderRadius: "16px", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}>
                  <UserPlus size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Personnel Enrollment</h2>
                  <p style={{ opacity: 0.9, fontSize: "0.95rem", fontWeight: 500 }}>Provisioning organizational clearance and endpoint telemetry.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label className="stat-label" style={{ fontSize: "0.75rem" }}><UserPlus size={14} style={{ marginRight: "0.4rem" }} /> Legal Full Name</label>
                <div className="search-input-wrap">
                  <input 
                    required
                    className="search-input"
                    style={{ paddingLeft: "1rem" }}
                    type="text" 
                    value={form.employeeName}
                    onChange={e => setForm({...form, employeeName: e.target.value})}
                    placeholder="e.g. Johnathan Vance"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label className="stat-label" style={{ fontSize: "0.75rem" }}><Mail size={14} style={{ marginRight: "0.4rem" }} /> Corporate Email</label>
                  <div className="search-input-wrap">
                    <input 
                      required
                      className="search-input"
                      style={{ paddingLeft: "1rem" }}
                      type="email" 
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="vance@nexus.com"
                    />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label className="stat-label" style={{ fontSize: "0.75rem" }}><Hash size={14} style={{ marginRight: "0.4rem" }} /> Personnel ID</label>
                  <div className="search-input-wrap">
                    <input 
                      required
                      className="search-input"
                      style={{ paddingLeft: "1rem" }}
                      type="text" 
                      value={form.employeeId}
                      onChange={e => setForm({...form, employeeId: e.target.value})}
                      placeholder="NXS-4092"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label className="stat-label" style={{ fontSize: "0.75rem" }}><Briefcase size={14} style={{ marginRight: "0.4rem" }} /> Departmental Unit</label>
                  <select 
                    className="search-input"
                    style={{ paddingLeft: "1rem", appearance: "none" }}
                    value={form.department}
                    onChange={e => setForm({...form, department: e.target.value})}
                  >
                    <option>Engineering</option>
                    <option>Product Design</option>
                    <option>Core Operations</option>
                    <option>Strategic Sales</option>
                    <option>Brand Marketing</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label className="stat-label" style={{ fontSize: "0.75rem" }}><Shield size={14} style={{ marginRight: "0.4rem" }} /> Clearance Role</label>
                  <div className="search-input-wrap">
                    <input 
                      className="search-input"
                      style={{ paddingLeft: "1rem" }}
                      type="text" 
                      value={form.role}
                      onChange={e => setForm({...form, role: e.target.value})}
                      placeholder="Lead Operational Architect"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, height: "54px" }}>Abort</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1.5, height: "54px", justifyContent: "center" }}>
                  {loading ? "Synchronizing..." : "Finalize Enrollment"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
