import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:4000/api";

export function useActivityData() {
  const [appUsage,       setAppUsage]       = useState([]);
  const [dailyData,      setDailyData]      = useState([]);
  const [stats,          setStats]          = useState(null);
  const [attendance,     setAttendance]     = useState([]);
  const [systemHistory,  setSystemHistory]  = useState([]);
  const [liveSystem,     setLiveSystem]     = useState({ cpu: 0, ram: 0 });
  const [timeline,       setTimeline]       = useState([]);
  const [liveInfo,       setLiveInfo]       = useState({});
  const [loading,        setLoading]        = useState(true);
  const [connected,      setConnected]      = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [liveRes, appsRes, histRes, statsRes, attRes, dailyRes, tlRes] = await Promise.all([
        fetch(`${API}/live`),
        fetch(`${API}/apps`),
        fetch(`${API}/system-history`),
        fetch(`${API}/stats`),
        fetch(`${API}/attendance`),
        fetch(`${API}/daily`),
        fetch(`${API}/timeline`),
      ]);

      const live   = await liveRes.json();
      const apps   = await appsRes.json();
      const hist   = await histRes.json();
      const st     = await statsRes.json();
      const att    = await attRes.json();
      const daily  = await dailyRes.json();
      const tl     = await tlRes.json();

      setLiveInfo(live);
      setLiveSystem({ cpu: live.cpu, ram: live.ramGB });
      setAppUsage(apps);
      setSystemHistory(hist);
      setStats(st);
      setAttendance(att);
      setDailyData(daily);
      setTimeline(tl);
      setConnected(true);
      setLoading(false);
    } catch {
      // Monitor server not running — show empty state
      setConnected(false);
      setStats({
        totalActiveHours: "0", avgDailyHours: "0", productivityScore: 0,
        idlePercent: 0, keystrokes: 0, mouseClicks: 0,
        cpuAvg: 0, ramUsed: 0, sessionsToday: 0, uptimeMinutes: 0,
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return {
    appUsage, dailyData, stats, attendance,
    systemHistory, liveSystem, timeline, liveInfo,
    loading, connected,
  };
}
