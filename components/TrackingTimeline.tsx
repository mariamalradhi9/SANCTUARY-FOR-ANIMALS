"use client";

export interface TimelineStep {
  label: string;
  date?: string;
  state: "done" | "current" | "upcoming";
}

export default function TrackingTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="v-timeline">
      {steps.map((s, i) => (
        <li className={`v-timeline-item ${s.state}`} key={i}>
          <span className="v-timeline-dot">{s.state === "done" ? "✓" : ""}</span>
          <div className="v-timeline-body">
            <strong>{s.label}</strong>
            {s.date && <span className="v-timeline-date">{s.date}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
