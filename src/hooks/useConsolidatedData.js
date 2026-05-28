import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Centralized hook that maps users to devices to sessions
 * Fixes "Unknown User" issues by maintaining uid relationships
 */
export function useConsolidatedData() {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time sync users
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const list = snap.docs.map((d) => ({
          uid: d.id,
          ...d.data(),
        }));
        setUsers(list);
      },
      (err) => console.warn("[useConsolidatedData] users error:", err.message)
    );
    return unsub;
  }, []);

  // Real-time sync devices
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "devices"),
      (snap) => {
        const list = snap.docs.map((d) => ({
          deviceId: d.id,
          ...d.data(),
        }));
        list.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));
        setDevices(list);
      },
      (err) => console.warn("[useConsolidatedData] devices error:", err.message)
    );
    return unsub;
  }, []);

  // Real-time sync sessions
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "sessions"),
      (snap) => {
        const list = snap.docs.map((d) => ({
          sessionId: d.id,
          ...d.data(),
        }));
        setSessions(list);
        setLoading(false);
      },
      (err) => {
        console.warn("[useConsolidatedData] sessions error:", err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  // Real-time sync activities
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "activities"),
      (snap) => {
        const list = snap.docs.map((d) => ({
          activityId: d.id,
          ...d.data(),
        }));
        setActivities(list);
      },
      (err) => console.warn("[useConsolidatedData] activities error:", err.message)
    );
    return unsub;
  }, []);

  // Build maps and enriched data
  const data = useMemo(() => {
    // Map users by uid
    const uMap = Object.fromEntries(users.map(u => [u.uid, u]));

    // Map devices by deviceId
    const dMap = Object.fromEntries(devices.map(d => [d.deviceId, d]));

    // Build enriched devices with realistic demo data fallbacks
    const enrichedDevs = devices.map(dev => {
      const uid = dev.uid || dev.userId;
      const user = uid ? uMap[uid] : null;
      return {
        ...dev,
        user: user || null,
        uid: uid || null,
        employeeName: user?.employeeName || user?.displayName || "Unassigned",
        employeeId: user?.employeeId || "--",
        currentApp: dev.currentApp || (dev.isOnline ? "Desktop" : "Offline"),
        windowTitle: dev.windowTitle || "",
        productivityScore: dev.productivityScore || user?.productivityScore || 0,
        activeHours: dev.activeHours || "0.0",
        ramUsage: dev.ramUsage || 0,
        cpuUsage: dev.cpuUsage || 0,
        ipAddress: dev.ipAddress || "--",
        lastActive: dev.lastSeen || dev.updatedAt || new Date().toISOString(),
      };
    });

    const employeesOnly = users.filter(u => u.role !== "admin");
    const employeeDevices = enrichedDevs.filter(d => d.user?.role !== "admin");

    const onlineUids = new Set(
      employeeDevices.filter(d => d.isOnline).map(d => d.uid || d.userId).filter(Boolean)
    );
    
    const totalCount = employeesOnly.length;
    const onlineCount = onlineUids.size;
    const absentCount = Math.max(0, totalCount - onlineCount);

    const stats = {
      totalUsers: totalCount,
      onlineUsers: onlineCount,
      offlineUsers: absentCount,
      avgProductivity: totalCount > 0
        ? Math.round(employeesOnly.reduce((sum, u) => sum + (u.productivityScore || 0), 0) / totalCount)
        : 0,
      totalActiveHours: employeeDevices.reduce((sum, d) => sum + parseFloat(d.activeHours || 0), 0).toFixed(1),
      totalKeystrokes: employeeDevices.reduce((sum, d) => sum + (d.keystrokes || 0), 0),
      totalClicks: employeeDevices.reduce((sum, d) => sum + (d.mouseClicks || 0), 0),
    };

    return {
      usersMap: uMap,
      devicesMap: dMap,
      enrichedDevices: enrichedDevs, // Keep all for debugging if needed
      employeeDevices: employeeDevices, // For devices list
      employees: employeesOnly, // Excludes admins
      aggregated: stats,
    };
  }, [users, devices, sessions, activities]);

  return {
    users,
    devices,
    ...data,
    loading,
  };
}
