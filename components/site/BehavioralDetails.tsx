import type { Assessment } from "@/lib/types";
import { PROFILE_METRIC_LABELS } from "@/lib/petProfile";

export default function BehavioralDetails({ latest }: { latest: Assessment | null }) {
  if (!latest) return null;

  const scoreRows = PROFILE_METRIC_LABELS.filter(([key]) => latest.profileScores?.[key]);
  const drives: [string, string][] = [
    ["Prey / Toy Drive", latest.preyDrive],
    ["Food Drive", latest.foodDrive],
    ["Social Drive", latest.socialDrive],
  ].filter(([, value]) => value) as [string, string][];

  const dogToDog: [string, string][] = [
    ["Social Orientation", latest.socialOrientation],
    ["Posturing", (latest.posturing || []).join(", ")],
    ["Space Claiming", (latest.spaceClaiming || []).join(", ")],
    ["Yields Space When Pressured", latest.socialYield || ""],
  ].filter(([, value]) => value) as [string, string][];

  const hasRedFlags = (latest.redFlags || []).length > 0;
  const hasIncidents = !!latest.incidentHistory;

  return (
    <>
      {scoreRows.length > 0 && (
        <>
          <h4 className="sub-title">🧠 Temperament Profile (Scale 1–5: 1 = Minimal/Low, 5 = Intense/High Expression)</h4>
          <table className="profile-table">
            <thead><tr><th>Behavioral Metric</th><th>Score</th></tr></thead>
            <tbody>
              {scoreRows.map(([key, label]) => (
                <tr key={key}><td>{label}</td><td><strong>{latest.profileScores[key]} / 5</strong></td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {drives.length > 0 && (
        <>
          <h4 className="sub-title">⚡ Drive System Analysis (Motivation)</h4>
          <div className="behavior-traits">
            {drives.map(([label, value]) => (
              <div className="behavior-trait" key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>
        </>
      )}

      {dogToDog.length > 0 && (
        <>
          <h4 className="sub-title"><img src="/icons/paw.png" alt="" className="icon-img-sm" /> Dog-to-Dog Dynamics</h4>
          <div className="behavior-traits">
            {dogToDog.map(([label, value]) => (
              <div className="behavior-trait" key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>
        </>
      )}

      {(hasRedFlags || hasIncidents) && (
        <>
          <h4 className="sub-title">⚠️ Safety Indicators &amp; Bite Log</h4>
          {hasRedFlags && (
            <div className="chip-list">
              {latest.redFlags.map((f) => (
                <span className="badge badge-danger" key={f}>{f}</span>
              ))}
            </div>
          )}
          {hasIncidents && <p style={{ marginTop: 10 }}>{latest.incidentHistory}</p>}
        </>
      )}
    </>
  );
}
