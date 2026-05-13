import { useActivityData } from "../hooks/useActivityData";

export default function ActivityTimeline() {
  const { timeline } = useActivityData();

  const events = timeline?.length ? timeline : [
    { time: "--", event: "No activity yet", color: "slate" },
  ];

  return (
    <div className="timeline-wrap">
      {events.map((item, i) => (
        <div key={i} className="tl-row">
          <div className="tl-time">{item.time}</div>
          <div className="tl-line-wrap">
            <div className={`tl-dot tl-dot-${item.color || 'blue'}`}>●</div>
            {i < events.length - 1 && <div className="tl-line" />}
          </div>
          <div className="tl-event">{item.event}</div>
        </div>
      ))}
    </div>
  );
}
