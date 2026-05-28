import { motion } from "framer-motion";
import { ShieldCheck, Monitor, Activity, LogOut, Clock, Wifi, Mail, TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function EmployeeView() {
  const { currentUser, userProfile, logout } = useAuth();
  
  const name = userProfile?.employeeName || userProfile?.displayName || currentUser?.email?.split('@')[0];
  const position = userProfile?.department || "Employee";

  return (
    <div className="employee-root">
      <div className="employee-bg-grid" />
      
      <div className="employee-nav">
        <div className="nav-logo">
          <div className="logo-icon"><Monitor size={20} /></div>
          <span>Employee Attendance <strong>Agent</strong></span>
        </div>
        <button onClick={logout} className="logout-pill">
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <main className="employee-main">
        <motion.div 
          className="status-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="user-hero">
            <h1>{name}</h1>
            <p className="position-text">{position}</p>
          </div>

          <div className="tracking-status-box">
            <div className="pulse-container">
              <div className="pulse-ring" />
              <div className="pulse-dot" />
            </div>
            <span className="status-text">Tracking Active</span>
          </div>

          <div className="info-list">
            <div className="info-item">
              <Wifi size={16} className="text-green" />
              <span>Connected to Server</span>
            </div>
            <div className="info-item">
              <Activity size={16} className="text-green" />
              <span>Status: Online</span>
            </div>
          </div>

        </motion.div>
      </main>

      <style>{`
        .employee-root {
          min-height: 100vh;
          background: #0f172a;
          color: white;
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .employee-bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 2px 2px, rgba(99,102,241,0.05) 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }
        .employee-nav {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }
        .nav-logo { display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; }
        .logo-icon {
          background: #6366f1;
          padding: 0.5rem;
          border-radius: 0.5rem;
          display: flex;
        }
        .logout-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .logout-pill:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
        
        .employee-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          z-index: 5;
        }
        .status-card {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 2rem;
          width: 100%;
          max-width: 480px;
          padding: 3rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
        }
        .status-header {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          margin-bottom: 2rem;
        }
        .status-text { color: #10b981; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .pulse-container { position: relative; width: 10px; height: 10px; }
        .pulse-ring {
          position: absolute;
          width: 100%; height: 100%;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .pulse-dot {
          position: absolute;
          width: 100%; height: 100%;
          background: #10b981;
          border-radius: 50%;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }

        .user-hero h1 { font-size: 2rem; margin: 0; color: #f8fafc; font-weight: 600; letter-spacing: -0.02em; }
        .position-text { color: #94a3b8; font-size: 1.1rem; margin-top: 0.5rem; margin-bottom: 2rem; }

        .tracking-status-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 1rem 2rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          width: 100%;
        }
        .status-text { color: #10b981; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
        .pulse-container { position: relative; width: 12px; height: 12px; }
        .pulse-ring {
          position: absolute;
          width: 100%; height: 100%;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .pulse-dot {
          position: absolute;
          width: 100%; height: 100%;
          background: #10b981;
          border-radius: 50%;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .info-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1rem;
          color: #cbd5e1;
          font-weight: 500;
        }
        .text-green { color: #10b981; }
      `}</style>
    </div>
  );
}
