import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];

/**
 * Productivity Trend Chart (Area)
 */
export function ProductivityTrendChart({ data }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--text3)", fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--text3)", fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ background: "#1e293b", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }}
            itemStyle={{ color: "#fff", fontWeight: 700 }}
          />
          <Area 
            type="monotone" 
            dataKey="productivity" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorProd)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Weekly Attendance Chart (Bar)
 */
export function AttendanceBarChart({ data }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--text3)", fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--text3)", fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
            contentStyle={{ background: "#1e293b", border: "1px solid var(--border)", borderRadius: "12px" }}
          />
          <Bar dataKey="present" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
          <Bar dataKey="absent" fill="rgba(239, 68, 68, 0.5)" radius={[6, 6, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * App Usage Distribution (Pie)
 */
export function AppUsagePieChart({ data }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ background: "#1e293b", border: "1px solid var(--border)", borderRadius: "12px" }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span style={{ color: "var(--text2)", fontSize: "0.8rem" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
