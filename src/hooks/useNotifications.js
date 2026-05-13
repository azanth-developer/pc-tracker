import { useState, useEffect, useRef } from "react";
import { useDevices } from "./useFirestoreData";

export function useNotifications() {
  const { devices } = useDevices();
  const [notifications, setNotifications] = useState([]);
  const prevDevicesRef = useRef({});
  const idCounter = useRef(0);

  useEffect(() => {
    const newNotifs = [];
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    devices.forEach((dev) => {
      const prev = prevDevicesRef.current[dev.id];

      // Device came online
      if (prev && !prev.isOnline && dev.isOnline) {
        newNotifs.push({
          id: ++idCounter.current,
          type: "online",
          title: "Device Online",
          message: `${dev.hostname || dev.id} is now online`,
          time: now,
          read: false,
        });
      }

      // Device went offline
      if (prev && prev.isOnline && !dev.isOnline) {
        newNotifs.push({
          id: ++idCounter.current,
          type: "offline",
          title: "Device Offline",
          message: `${dev.hostname || dev.id} went offline`,
          time: now,
          read: false,
        });
      }

      // Idle alert (idle > 10 minutes)
      if (dev.isOnline && (dev.idleSeconds || 0) > 600 && prev && (prev.idleSeconds || 0) <= 600) {
        newNotifs.push({
          id: ++idCounter.current,
          type: "idle",
          title: "User Idle",
          message: `${dev.hostname || dev.id} has been idle for 10+ minutes`,
          time: now,
          read: false,
        });
      }

      // High CPU alert
      if (dev.isOnline && (dev.cpu || 0) > 90 && prev && (prev.cpu || 0) <= 90) {
        newNotifs.push({
          id: ++idCounter.current,
          type: "alert",
          title: "High CPU Usage",
          message: `${dev.hostname || dev.id} CPU at ${dev.cpu}%`,
          time: now,
          read: false,
        });
      }
    });

    if (newNotifs.length > 0) {
      setNotifications((prev) => [...newNotifs, ...prev].slice(0, 50));
    }

    // Store current state for comparison
    const devMap = {};
    devices.forEach((d) => { devMap[d.id] = { ...d }; });
    prevDevicesRef.current = devMap;
  }, [devices]);

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead, clearAll };
}
