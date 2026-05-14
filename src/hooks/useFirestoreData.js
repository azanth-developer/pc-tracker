// Real-time Firestore hooks for centralized employee monitoring
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection, doc, onSnapshot, query, orderBy, limit, where,
} from "firebase/firestore";
import { db } from "../firebase";

// ── Hook: All devices (real-time) ──────────────────────────────────────────
export function useDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "devices"),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));
        setDevices(list);
        setLoading(false);
      },
      (error) => {
        console.warn("[Firestore] devices listener error:", error.message);
        setLoading(false); // Don't hang on permission errors
      }
    );
    return unsub;
  }, []);

  const online = devices.filter((d) => d.isOnline).length;
  const offline = devices.length - online;

  return { devices, online, offline, total: devices.length, loading };
}


// ── Hook: Single device (real-time) ────────────────────────────────────────
export function useDevice(deviceId) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;
    const unsub = onSnapshot(doc(db, "devices", deviceId), (snap) => {
      if (snap.exists()) setDevice({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return unsub;
  }, [deviceId]);

  return { device, loading };
}

// ── Hook: All users (real-time) ────────────────────────────────────────────
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { users, loading };
}

// ── Hook: Sessions for a device/user ───────────────────────────────────────
export function useSessions(deviceId) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) {
      // Get all sessions
      const q = query(collection(db, "sessions"), orderBy("startTime", "desc"), limit(50));
      const unsub = onSnapshot(q, (snap) => {
        setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return unsub;
    }
    const q = query(
      collection(db, "sessions"),
      where("deviceId", "==", deviceId),
      orderBy("startTime", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [deviceId]);

  return { sessions, loading };
}

// ── Hook: Running apps for a device ────────────────────────────────────────
export function useRunningApps(deviceId) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "runningApps", deviceId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setApps(data.processes || []);
      }
      setLoading(false);
    });
    return unsub;
  }, [deviceId]);

  return { apps, loading };
}

// ── Hook: System stats history ─────────────────────────────────────────────
export function useSystemStats(deviceId) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "systemStats", deviceId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats(data.history || []);
      }
      setLoading(false);
    });
    return unsub;
  }, [deviceId]);

  return { stats, loading };
}

// ── Hook: Activities ───────────────────────────────────────────────────────
export function useActivities(deviceId) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "activities", deviceId), (snap) => {
      if (snap.exists()) {
        setActivities(snap.data());
      }
      setLoading(false);
    });
    return unsub;
  }, [deviceId]);

  return { activities, loading };
}

// ── Hook: Aggregated dashboard stats from all devices ──────────────────────
export function useDashboardStats() {
  const { devices, loading: devLoading } = useDevices();
  const { users, loading: userLoading } = useUsers();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!devLoading && !userLoading) setLoading(false);
  }, [devLoading, userLoading]);

  // Join users and devices to create a complete Employee list
  const employees = useMemo(() => {
    if (!users || !devices) return [];

    const norm = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");

    const usersByUid = Object.fromEntries(
      (users || []).map((u) => [u?.id, u])
    );

    // Build deviceId -> uid mapping defensively.
    // uid is the single source of truth relation key.
    const uidForDeviceId = Object.fromEntries(
      (devices || [])
        .map((d) => {
          const deviceId = d?.id;
          const uid = d?.userId ?? d?.uid ?? d?.userID ?? d?.userID?.toString?.();
          return deviceId ? [deviceId, uid] : null;
        })
        .filter(Boolean)
    );

    return (users || []).map((user) => {
      // Firestore document ID for the user (uid)
      const uid = user.id;

      const displayName =
        user.displayName ||
        user.fullName ||
        user.name ||
        user.userName ||
        (user.email ? user.email.split("@")[0] : "Employee");

      const employeeName =
        user.employeeName ||
        user.displayName ||
        user.fullName ||
        user.name ||
        (user.email ? user.email.split("@")[0] : "Employee");

      const employeeId = user.employeeId || user.employeeID || user.employee_id || "";
      const email = user.email || user.userEmail || user.emailAddress;

      // Prefer direct uid match (enterprise expectation), fallback to email match.
      const device = (devices || []).find((d) => {
        const dUid = d?.userId ?? d?.uid ?? d?.userID;
        if (uid != null && dUid != null && String(dUid) === String(uid)) return true;

        const userEmailNorm = norm(user.email);
        const dEmailNorm = norm(d?.userEmail);
        if (userEmailNorm && dEmailNorm && dEmailNorm === userEmailNorm) return true;

        return false;
      });

      return {
        ...user,
        ...(device || {}),

        // Standardized fields
        uid,
        id: uid,
        employeeId,
        employeeName,
        email,

        displayName: employeeName,
        fullName: user.fullName || user.displayName || user.name || employeeName,
        userName: user.userName || user.name || user.displayName || employeeName,
        name: user.name || user.displayName || employeeName,

        // Standardized telemetry fields
        isOnline: device ? !!device.isOnline : false,
        lastSeen: device ? device.lastSeen : undefined,
        deviceName: device ? (device.deviceName || device.hostname || device.host) : undefined,
        activeHours: device ? device.activeHours || 0 : 0,
        productivity: device ? device.productivityScore || device.productivity || 0 : user.productivity || 0,
        productivityScore: device
          ? device.productivityScore ?? device.productivity ?? 0
          : user.productivity ?? 0,
        currentApp: device ? device.currentApp || "Idle" : "Offline",

        // expose mapping helpers if consumers need them
        usersByUid,
        uidForDeviceId,
      };
    });
  }, [users, devices]);

  const online = employees.filter(e => e.isOnline).length;
  const total = employees.length;

  const aggregated = {
    totalActiveHours: employees.reduce((s, e) => s + (e.activeHours || 0), 0),
    totalKeystrokes: employees.reduce((s, e) => s + (e.keystrokes || 0), 0),
    avgProductivity: employees.length > 0 ? Math.round(employees.reduce((s, e) => s + (e.productivityScore || 0), 0) / employees.length) : 0,
    attendance: { present: 0, halfDay: 0, absent: 0 }
  };

  employees.forEach(e => {
    const h = e.activeHours || 0;
    if (h >= 8) aggregated.attendance.present++;
    else if (h >= 4) aggregated.attendance.halfDay++;
    else aggregated.attendance.absent++;
  });

  return {
    employees, online, total, aggregated, loading,
  };
}
