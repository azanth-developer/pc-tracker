import { motion } from "framer-motion";
import { ShieldCheck, Monitor, Activity, LogOut, Clock, Wifi, Mail, TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function EmployeeView() {
  const { currentUser, logout } = useAuth();

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
          <div className="status-header">
            <div className="pulse-container">
              <div className="pulse-ring" />
              <div className="pulse-dot" />
            </div>
            <span className="status-text">System Monitoring Active</span>
          </div>

          <div className="user-hero">
            <div className="hero-icon">
              <ShieldCheck size={48} className="shield-glow" />
            </div>
            <h1>Welcome, {currentUser?.email?.split('@')[0]}</h1>
            <p>Your productivity and system health are being monitored to ensure peak performance.</p>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <Mail size={16} />
              <label>Account</label>
              <span>{currentUser?.email}</span>
            </div>
            <div className="info-item">
              <Wifi size={16} />
              <label>Connection</label>
              <span className="text-green">Cloud Synchronized</span>
            </div>
            <div className="info-item">
              <Clock size={16} />
              <label>Last Sync</label>
              <span>Just now</span>
            </div>
          </div>

          <div className="footer-notice">
             <Activity size={12} />
             <span>Activity tracking is currently enabled for this workstation.</span>
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

        .user-hero h1 { font-size: 1.8rem; margin: 1.5rem 0 0.5rem; }
        .user-hero p { color: #94a3b8; line-height: 1.6; margin-bottom: 2.5rem; }
        .shield-glow { color: #6366f1; filter: drop-shadow(0 0 10px rgba(99,102,241,0.4)); }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          text-align: left;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .info-item label { display: block; font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin: 0.5rem 0 0.25rem; }
        .info-item span { font-size: 0.85rem; font-weight: 500; word-break: break-all; }
        .info-item svg { color: #6366f1; opacity: 0.6; }
        .text-green { color: #10b981; }

        .footer-notice {
          margin-top: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #475569;
        }
      `}</style>
    </div>
  );
}
