import { Wifi, WifiOff } from "lucide-react";

export default function DemoBanner({ connected }) {
  if (connected) {
    return (
      <div className="demo-banner" style={{ background: "rgba(52,211,153,.1)", borderColor: "rgba(52,211,153,.25)", color: "#34d399" }}>
        <Wifi size={15} />
        <span>
          <strong>Live Monitoring Active</strong> — Tracking your PC in real-time. Data refreshes every 3 seconds.
        </span>
      </div>
    );
  }

  return (
    <div className="demo-banner" style={{ background: "rgba(248,113,113,.1)", borderColor: "rgba(248,113,113,.25)", color: "#f87171" }}>
      <WifiOff size={15} />
      <span>
        <strong>Monitor Offline</strong> — Start the monitor server: <code>npm run monitor</code>
      </span>
    </div>
  );
}
