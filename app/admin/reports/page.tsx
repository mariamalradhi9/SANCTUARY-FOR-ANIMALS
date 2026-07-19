"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { getAnimals } from "@/lib/animals";
import { getApplications, getBookings } from "@/lib/records";
import { getAuditLog, logAudit } from "@/lib/admin/audit";
import AuditActionLabel from "@/components/admin/AuditActionLabel";
import { daysSince, formatDate, isOverdue } from "@/lib/format";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Animal, Application, AuditLogEntry, Booking } from "@/lib/types";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function csvCell(value: unknown): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function exportDonorReport(animals: Animal[], apps: Application[], bookings: Booking[]) {
  const headers = ["Name", "Species", "Breed", "Onboarding Date", "Days in Care", "Govt Support", "Govt Support Value (BD)", "Medical Status", "Vaccination Status", "Ready for Adoption", "Adoption Date", "Adoption Type", "Destination Country"];
  const rows = animals.map((a) => [
    a.name, a.species, a.breed, a.onboardingDate || "", a.onboardingDate ? daysSince(a.onboardingDate) ?? "" : "",
    a.govtSupport || "No", a.govtSupportValue || "", a.medicalStatus || "", a.vaccinationStatus || "",
    a.readyForAdoption || "No", a.adoptionDate || "", a.adoptionType || "", a.destinationCountry || "",
  ]);

  const summaryLines: (string | number)[][] = [
    [`Aamal Almoayyed Sanctuary — Donor / Grant Report`],
    [`Generated`, new Date().toLocaleString()],
    [`Total Animals`, animals.length],
    [`Adopted`, animals.filter((a) => a.readyForAdoption === "Yes" && a.adoptionDate).length],
    [`Total Adoption Applications`, apps.length],
    [`Total Visit Bookings`, bookings.length],
    [`Total Government Support Received (BD)`, animals.reduce((sum, a) => sum + (Number(a.govtSupportValue) || 0), 0).toFixed(3)],
    [],
    headers,
    ...rows,
  ];

  const csv = summaryLines.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aamal-almoayyed-donor-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  usePageTitle("Reports — Admin — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    setAnimals(getAnimals());
    setApplications(getApplications());
    setBookings(getBookings());
    setAuditLog(getAuditLog());
  }, []);

  function handleExport() {
    exportDonorReport(animals, applications, bookings);
    logAudit("report-exported", "Donor / grant CSV report exported.");
    setAuditLog(getAuditLog());
    showToast("Report downloaded.");
  }

  const approvalRate = useMemo(() => {
    const decided = applications.filter((a) => a.status === "Approved" || a.status === "Declined");
    const rate = decided.length ? Math.round((applications.filter((a) => a.status === "Approved").length / decided.length) * 100) : 0;
    return { rate, sub: `${applications.filter((a) => a.status === "Approved").length} of ${decided.length} decided` };
  }, [applications]);

  const mostWalked = useMemo(() => {
    const walkCounts: Record<string, number> = {};
    bookings.filter((b) => b.activity === "walk").forEach((b) => {
      walkCounts[b.petName] = (walkCounts[b.petName] || 0) + 1;
    });
    const top = Object.entries(walkCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      name: top ? top[0] : "—",
      sub: top ? `${top[1]} walk${top[1] > 1 ? "s" : ""} logged` : "No walks yet",
    };
  }, [bookings]);

  const cancelRate = useMemo(
    () => (bookings.length ? Math.round((bookings.filter((b) => b.status === "Cancelled").length / bookings.length) * 100) : 0),
    [bookings]
  );

  const uniqueVisitors = useMemo(
    () => new Set(bookings.map((b) => (b.name || "").trim().toLowerCase()).filter(Boolean)).size,
    [bookings]
  );

  const chartMonths = useMemo(() => {
    const now = new Date();
    const months: { year: number; month: number; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_SHORT[d.getMonth()], count: 0 });
    }
    bookings.forEach((b) => {
      const d = new Date(b.date + "T00:00:00");
      const match = months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
      if (match) match.count += 1;
    });
    return months;
  }, [bookings]);
  const chartMax = Math.max(1, ...chartMonths.map((m) => m.count));

  const notes = useMemo(() => {
    const list: string[] = [];
    if (bookings.length > 0) {
      const weekdayCounts = new Array(7).fill(0);
      bookings.forEach((b) => {
        const d = new Date(b.date + "T00:00:00");
        weekdayCounts[d.getDay()] += 1;
      });
      const peakDay = weekdayCounts.indexOf(Math.max(...weekdayCounts));
      list.push(`${WEEKDAY_NAMES[peakDay]} receives the most visit requests.`);

      const petCounts: Record<string, number> = {};
      bookings.forEach((b) => { petCounts[b.petName] = (petCounts[b.petName] || 0) + 1; });
      const topPets = Object.entries(petCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([name]) => name);
      if (topPets.length) list.push(`${topPets.join(" and ")} ${topPets.length > 1 ? "are" : "is"} the most requested for visits.`);
    } else {
      list.push("No visit bookings recorded yet — insights will appear once visitors start booking.");
    }
    list.push(`${applications.length} adoption application${applications.length === 1 ? "" : "s"} received in total.`);
    list.push(`${bookings.length} visit booking${bookings.length === 1 ? "" : "s"} recorded in total.`);
    return list;
  }, [bookings, applications]);

  const careAlerts = useMemo(() => {
    const alerts: { level: "danger" | "warning"; node: React.ReactNode; key: string }[] = [];
    animals.forEach((a) => {
      if (a.nextVetCheckDue && isOverdue(a.nextVetCheckDue)) {
        alerts.push({
          level: "danger", key: `${a.id}-vet`,
          node: <><img src="/icons/alarm.png" alt="" className="icon-img-sm" /> MANDATORY VET / NAIL TRIM CHECK OVERDUE for <strong>{a.name}</strong> — was due {formatDate(a.nextVetCheckDue)} ({daysSince(a.nextVetCheckDue)} days ago).</>,
        });
      }
      if (a.medicalStatus === "Critical") {
        alerts.push({ level: "danger", key: `${a.id}-med`, node: <><img src="/icons/alarm.png" alt="" className="icon-img-sm" /> <strong>{a.name}</strong> has a Critical medical status — needs immediate attention.</> });
      }
      if ((a.aggressionLevel === "High" || a.aggressionLevel === "Severe") && a.medicalStatus === "Under Treatment") {
        alerts.push({ level: "warning", key: `${a.id}-agg`, node: <>⚠️ <strong>{a.name}</strong> is {a.aggressionLevel.toLowerCase()}-aggression and under treatment — plan a safe multi-person handling protocol.</> });
      }
    });
    return alerts;
  }, [animals]);

  const losRows = useMemo(() => {
    return animals
      .filter((a) => a.onboardingDate)
      .map((a) => ({ ...a, los: daysSince(a.onboardingDate) || 0 }))
      .sort((a, b) => b.los - a.los);
  }, [animals]);

  const auditRows = useMemo(() => auditLog.slice().reverse().slice(0, 50), [auditLog]);

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="reports" />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast${show ? " show" : ""}`}>{message}</div>

            <div className="section-head admin-head" style={{ textAlign: "left", margin: "0 0 24px" }}>
              <div className="admin-card-head" style={{ margin: 0 }}>
                <div>
                  <span className="eyebrow">Insights</span>
                  <h1>Reports</h1>
                  <p>A snapshot of adoption and booking activity, computed from current records.</p>
                </div>
                <button type="button" className="btn btn-outline" onClick={handleExport}><img src="/icons/export.png" alt="" className="btn-icon" /> Export Donor / Grant Report (CSV)</button>
              </div>
            </div>

            <div className="admin-stats grid-4">
              <div className="admin-stat">
                <div className="admin-stat-head"><span>Approval Rate</span><span className="admin-stat-icon"><img src="/icons/check-clock.png" alt="" /></span></div>
                <h2>{approvalRate.rate}%</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{approvalRate.sub}</span>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-head"><span>Most Walked Animal</span><span className="admin-stat-icon"><img src="/icons/walk.png" alt="" /></span></div>
                <h2>{mostWalked.name}</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{mostWalked.sub}</span>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-head"><span>Cancellation Rate</span><span className="admin-stat-icon"><img src="/icons/cancelled.png" alt="" /></span></div>
                <h2>{cancelRate}%</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>of all visit bookings</span>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-head"><span>Total Visitors</span><span className="admin-stat-icon"><img src="/icons/visitor.png" alt="" /></span></div>
                <h2>{uniqueVisitors}</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>unique names on file</span>
              </div>
            </div>

            <div className="reports-grid">
              <div className="admin-card">
                <div className="admin-card-head"><h3>Monthly Booking Activity</h3></div>
                <div className="bar-chart">
                  <div className="bar-chart-gridlines">
                    <span></span><span></span><span></span><span></span>
                  </div>
                  {chartMonths.map((m) => (
                    <div className="bar-chart-col" key={`${m.year}-${m.month}`}>
                      <div className="bar-chart-bar-wrap">
                        <span className="bar-chart-count">{m.count || ""}</span>
                        <div
                          className={`bar-chart-bar${m.count === 0 ? " zero" : ""}${m.count === chartMax && chartMax > 0 ? " peak" : ""}`}
                          style={{ height: m.count === 0 ? "4px" : `${Math.max(10, (m.count / chartMax) * 100)}%` }}
                          title={`${m.count} bookings`}
                        />
                      </div>
                      <span className="bar-chart-label">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-head"><h3>Operational Notes</h3></div>
                <ul className="report-notes">
                  {notes.map((n, i) => <li key={i}>• {n}</li>)}
                </ul>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-head"><h3><img src="/icons/alarm.png" alt="" className="icon-img-md" /> Mandatory Care Alerts</h3></div>
              {careAlerts.length === 0 ? (
                <p className="admin-empty">No overdue care tasks right now — all animals are up to date.</p>
              ) : (
                <ul className="report-notes">
                  {careAlerts.map((a) => <li className={`alert-${a.level}`} key={a.key}>{a.node}</li>)}
                </ul>
              )}
            </div>

            <div className="admin-card">
              <div className="admin-card-head"><h3><img src="/icons/hourglass.png" alt="" className="icon-img-md" /> Length of Stay (LOS)</h3></div>
              <p className="hint" style={{ marginBottom: 14 }}>Animals in care the longest — flagged in red past 180 days so they don&apos;t get forgotten.</p>
              <div className="table-scroll">
                {losRows.length === 0 ? (
                  <p className="admin-empty">No onboarding dates recorded yet — add one from the Animals page to start tracking length of stay.</p>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>Animal</th><th>Onboarded</th><th>Days in Care</th><th>Status</th></tr></thead>
                    <tbody>
                      {losRows.map((a) => (
                        <tr key={a.id}>
                          <td>{a.name}</td>
                          <td>{formatDate(a.onboardingDate)}</td>
                          <td><strong>{a.los}</strong> days</td>
                          <td>
                            {a.los > 180 ? (
                              <span className="badge badge-danger"><img src="/icons/alarm.png" alt="" className="icon-img-sm" /> Long-term — push for adoption</span>
                            ) : (
                              <span className="badge badge-success">On track</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-head"><h3><img src="/icons/lock.png" alt="" className="icon-img-md" /> Audit Trail</h3></div>
              <p className="hint" style={{ marginBottom: 14 }}>Every save, status change and assessment is logged here for inspections and incident review.</p>
              <div className="table-scroll">
                {auditRows.length === 0 ? (
                  <p className="admin-empty">No actions logged yet — the trail fills in as staff use the system.</p>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>When</th><th>Action</th><th>Details</th></tr></thead>
                    <tbody>
                      {auditRows.map((entry, i) => (
                        <tr key={i}>
                          <td style={{ whiteSpace: "nowrap" }}>{new Date(entry.at).toLocaleString()}</td>
                          <td style={{ whiteSpace: "nowrap" }}><AuditActionLabel action={entry.action} /></td>
                          <td>{entry.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
