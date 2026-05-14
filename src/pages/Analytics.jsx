import React from "react";
import { motion } from "framer-motion";
import { useConsolidatedData } from "../hooks/useConsolidatedData";
import { 
  BarChart3, TrendingUp, Users, Clock, 
  Download, Filter, ChevronRight, Activity,
  PieChart, LineChart, Target
} from "lucide-react";
import { 
  ProductivityTrendChart, AttendanceBarChart, AppUsagePieChart 
} from "../components/DashboardCharts";

export default function Analytics() {
  const { users, loading } = useConsolidatedData();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p>Analyzing Performance Vectors...</p>
      </div>
    );
  }

  // Calculate real department performance from live users
  const deptMap = {};
  users.forEach(u => {
    const dept = u.department || "Operations";
    if (!deptMap[dept]) deptMap[dept] = { sum: 0, count: 0 };
    deptMap[dept].sum += (u.productivityScore || 0);
    deptMap[dept].count += 1;
  });

  const deptPerformance = Object.entries(deptMap).map(([name, stats]) => ({
    name,
    productivity: Math.round(stats.sum / stats.count),
    status: "stable"
  })).sort((a, b) => b.productivity - a.productivity);

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Intelligence & Analytics</h2>
          <p className="page-desc">Advanced behavioral modeling and organizational performance diagnostics.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-secondary">
            <Filter size={18} /> Structural Filters
          </button>
          <button className="btn-primary">
            <Download size={18} /> Generate Intel Report
          </button>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        <div className="chart-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "0.75rem", borderRadius: "12px", color: "var(--blue)" }}>
                <LineChart size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>Long-term Efficiency Projection</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text3)" }}>Quarterly productivity trend vs Organizational target</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 800 }}>MEAN INDEX</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--blue)" }}>84.5%</p>
            </div>
          </div>
          <div style={{ height: "300px" }}>
            <ProductivityTrendChart data={[
               { name: "Jan", productivity: 75 },
               { name: "Feb", productivity: 78 },
               { name: "Mar", productivity: 82 },
               { name: "Apr", productivity: 80 },
               { name: "May", productivity: 85 },
               { name: "Jun", productivity: 89 },
            ]} />
          </div>
        </div>

        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
            <div style={{ background: "rgba(168, 85, 247, 0.1)", padding: "0.75rem", borderRadius: "12px", color: "#a855f7" }}>
              <Target size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>Unit Performance</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text3)" }}>Comparative efficiency by department</p>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {deptPerformance.map((dept, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>{dept.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 600 }}>Active Nodes: {users.filter(u => (u.department || "Operations") === dept.name).length}</p>
                  </div>
                  <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--blue)" }}>{dept.productivity}%</span>
                </div>
                <div style={{ height: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "5px", overflow: "hidden", border: "1px solid var(--border)" }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.productivity}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    style={{ width: `${dept.productivity}%`, height: "100%", background: "var(--accent-gradient)", borderRadius: "5px", boxShadow: "0 0 10px var(--blue-glow)" }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        <div className="chart-card">
          <h3 className="chart-title"><Activity size={18} style={{ color: "var(--success)" }} /> Engagement Heatmap</h3>
          <div style={{ height: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text3)", background: "rgba(0,0,0,0.2)", borderRadius: "16px", border: "1px dashed var(--border)" }}>
             <TrendingUp size={48} style={{ opacity: 0.1, marginBottom: "1rem" }} />
             <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>Awaiting Sufficient Data Stream...</p>
             <p style={{ fontSize: "0.7rem", color: "var(--text3)" }}>Real-time pattern analysis pending.</p>
          </div>
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title"><PieChart size={18} style={{ color: "var(--warning)" }} /> Toolchain Allocation</h3>
          <div style={{ height: "220px" }}>
            <AppUsagePieChart data={[
              { name: "Production", value: 45 },
              { name: "Research", value: 25 },
              { name: "Collaboration", value: 20 },
              { name: "Misc", value: 10 },
            ]} />
          </div>
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title"><BarChart3 size={18} style={{ color: "#a855f7" }} /> Behavior Insights</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Peak Operational Window", value: "10:30 AM - 01:00 PM", icon: Clock, color: "var(--blue)" },
              { label: "Primary Work Tool", value: "Enterprise Workstation", icon: Laptop, color: "var(--success)" },
              { label: "Connectivity Drift", value: "+4.2% Stability", icon: TrendingUp, color: "var(--warning)" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border)" }}>
                <div style={{ color: item.color, background: `${item.color}15`, padding: "0.6rem", borderRadius: "10px" }}><item.icon size={20} /></div>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "var(--text3)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em" }}>{item.label}</p>
                  <p style={{ fontSize: "1rem", color: "#fff", fontWeight: 800 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
