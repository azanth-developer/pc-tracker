import { useState, useEffect } from "react";

export function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = time.toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const date = time.toLocaleDateString([], {
    weekday: "long", year: "numeric", month: "short", day: "numeric",
  });

  return { time, formatted, date };
}
