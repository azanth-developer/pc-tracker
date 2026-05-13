import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ id, icon, label, value, sub, color, progress, delay = 0 }) {
  return (
    <motion.div
      id={id}
      className={`stat-card stat-card-${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08 }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,.35)" }}
    >
      <div className="stat-card-top">
        <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
        {progress !== undefined && (
          <span className={`stat-trend ${progress > 70 ? "trend-up" : "trend-down"}`}>
            {progress > 70 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {progress > 70 ? "High" : "Low"}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
      {progress !== undefined && (
        <div className="stat-progress-bg">
          <motion.div
            className={`stat-progress-fill stat-progress-${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 1.2, delay: 0.3 }}
          />
        </div>
      )}
    </motion.div>
  );
}
