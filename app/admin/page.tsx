"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import BookingActionButtons from "@/components/admin/BookingActionButtons";
import ActivityLabel from "@/components/ActivityLabel";
import { getAnimals } from "@/lib/animals";
import { getBookings } from "@/lib/records";
import { applyBookingAction, type BookingAction } from "@/lib/admin/bookingActions";
import { badgeClassFor, daysSince, formatDate, isOverdue } from "@/lib/format";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Animal, Booking } from "@/lib/types";

const ACTIVITY_LABELS: Record<string, string> = { walk: "Walk", play: "Playtime", groom: "Groom" };
const AGGRESSION_BADGE: Record<string, string> = { Low: "badge-success", Medium: "badge-warning", High: "badge-danger", Severe: "badge-danger" };
const SPECIES_LABEL: Record<string, string> = { dog: "Dogs", cat: "Cats", rabbit: "Rabbits" };
const SPECIES_COLOR: Record<string, string> = { dog: "var(--color-secondary)", cat: "var(--color-primary)", rabbit: "var(--color-warning)" };
const SPECIES_GRADIENT: Record<string, string> = { dog: "url(#donut-dog)", cat: "url(#donut-cat)", rabbit: "url(#donut-rabbit)" };

function initials(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function pct(count: number, total: number): number {
  return total ? Math.round((count / total) * 100) : 0;
}

export default function AdminDashboardPage() {
  usePageTitle("Admin Dashboard — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [today, setToday] = useState("");

  useEffect(() => {
    setAnimals(getAnimals());
    setBookings(getBookings());
    setToday(new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }, []);

  function handleBookingAction(id: string, action: BookingAction) {
    const b = applyBookingAction(id, action);
    if (!b) return;
    setBookings(getBookings());
    showToast(`Booking for ${b.petName} marked as "${b.status}".`);
  }

  const totalAnimals = animals.length;
  const availableCount = animals.filter((a) => a.available !== false).length;
  const pendingBookings = bookings.filter((b) => b.status === "Requested").length;

  const completedThisMonth = useMemo(() => {
    const now = new Date();
    return bookings.filter((b) => {
      if (b.status !== "Completed") return false;
      const d = new Date(b.date + "T00:00:00");
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [bookings]);

  const careAlerts = useMemo(() => {
    const alerts: { key: string; node: React.ReactNode }[] = [];
    animals.forEach((a) => {
      if (a.nextVetCheckDue && isOverdue(a.nextVetCheckDue)) {
        alerts.push({
          key: `${a.id}-vet`,
          node: <><img src="/icons/alarm.png" alt="" className="icon-img-sm" /> MANDATORY VET / NAIL TRIM CHECK OVERDUE for <strong>{a.name}</strong> ({daysSince(a.nextVetCheckDue)} days overdue).</>,
        });
      }
      if (a.medicalStatus === "Critical") {
        alerts.push({ key: `${a.id}-med`, node: <><img src="/icons/alarm.png" alt="" className="icon-img-sm" /> <strong>{a.name}</strong> has a Critical medical status.</> });
      }
    });
    return alerts;
  }, [animals]);

  const careMetrics = useMemo(() => {
    const total = animals.length;
    return [
      { key: "vaccinations", label: "Vaccinations", icon: "/icons/vaccinated.png", value: pct(animals.filter((a) => a.vaccinationStatus === "Up to Date").length, total), sub: "Up to date" },
      { key: "checks", label: "Health Checks", icon: "/icons/check-clock.png", value: pct(animals.filter((a) => !a.nextVetCheckDue || !isOverdue(a.nextVetCheckDue)).length, total), sub: "On schedule" },
      { key: "nutrition", label: "Nutrition", icon: "/icons/weight.png", value: pct(animals.filter((a) => a.nutritionStatus === "Good").length, total), sub: "In good shape" },
      { key: "kennels", label: "Kennels Assigned", icon: "/icons/kennel.png", value: pct(animals.filter((a) => a.kennelNumber).length, total), sub: "Ready" },
    ];
  }, [animals]);

  const speciesBreakdown = useMemo(() => {
    const total = animals.length;
    const counts: Record<string, number> = {};
    animals.forEach((a) => { counts[a.species] = (counts[a.species] || 0) + 1; });
    let cumulative = 0;
    const circumference = 2 * Math.PI * 40;
    return Object.entries(counts).map(([species, count]) => {
      const fraction = total ? count / total : 0;
      const dash = fraction * circumference;
      const seg = { species, count, pct: pct(count, total), color: SPECIES_COLOR[species] || "var(--color-text-muted)", dasharray: `${dash} ${circumference - dash}`, dashoffset: -cumulative };
      cumulative += dash;
      return seg;
    });
  }, [animals]);

  const kennelAnimals = useMemo(
    () => animals.filter((a) => a.kennelNumber).slice().sort((a, b) => (a.kennelNumber || "").localeCompare(b.kennelNumber || "")),
    [animals]
  );

  const recentBookings = useMemo(() => bookings.slice().reverse().slice(0, 5), [bookings]);

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="dashboard" />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast${show ? " show" : ""}`}>{message}</div>

            <div className="dash-hero">
              <img className="dash-hero-bg" src="/img/admin-dashboard.png" alt="A dog and cat resting together at the sanctuary" />
              <div className="dash-hero-overlay" />
              <div className="dash-hero-copy">
                <span className="eyebrow">Admin Overview</span>
                <h1>Welcome back, Admin</h1>
                <p>Here&apos;s what&apos;s happening at the sanctuary today.</p>
                {today && <span className="dash-hero-date">{today}</span>}
              </div>
              <div className="dash-hero-quote">
                <span className="dash-hero-quote-mark">&ldquo;</span>
                <p>A safe shelter.<br />A second chance.<br />A forever home.</p>
              </div>
            </div>

            <div className="admin-stats grid-4">
              <div className="admin-stat">
                <div className="admin-stat-icon-badge"><img src="/icons/pets.png" alt="" /></div>
                <div className="admin-stat-head"><span>Total Animals</span></div>
                <h2>{totalAnimals}</h2>
                <Link href="/admin/animals">View all animals →</Link>
                <div className="admin-stat-corner"><img src="/icons/pets.png" alt="" /></div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-icon-badge"><img src="/icons/walk.png" alt="" /></div>
                <div className="admin-stat-head"><span>Available for Walks</span></div>
                <h2>{availableCount}</h2>
                <Link href="/admin/animals">View available →</Link>
                <div className="admin-stat-corner"><img src="/icons/walk.png" alt="" /></div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-icon-badge"><img src="/icons/calendar.png" alt="" /></div>
                <div className="admin-stat-head"><span>Pending Bookings</span></div>
                <h2>{pendingBookings}</h2>
                <Link href="/admin/bookings">Review requests →</Link>
                <div className="admin-stat-corner"><img src="/icons/calendar.png" alt="" /></div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-icon-badge"><img src="/icons/check-clock.png" alt="" /></div>
                <div className="admin-stat-head"><span>Completed This Month</span></div>
                <h2>{completedThisMonth}</h2>
                <Link href="/admin/reports">View reports →</Link>
                <div className="admin-stat-corner"><img src="/icons/check-clock.png" alt="" /></div>
              </div>
            </div>

            {careAlerts.length > 0 && (
              <div className="admin-card">
                <div className="admin-card-head">
                  <h3><img src="/icons/alarm.png" alt="" className="icon-img-md" /> Care Alerts</h3>
                  <Link href="/admin/reports" className="btn btn-ghost btn-sm">Full report →</Link>
                </div>
                <ul className="report-notes">
                  {careAlerts.map((a) => (
                    <li className="alert-danger" key={a.key}>{a.node}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="reports-grid reports-grid-loose">
              <div className="admin-card">
                <div className="admin-card-head">
                  <h3><img src="/icons/kennel.png" alt="" className="icon-img-md" /> Kennel Safety Overview</h3>
                  <Link href="/admin/animals" className="btn btn-ghost btn-sm">Manage animals →</Link>
                </div>
                <p className="hint" style={{ marginBottom: 14 }}>Every kennel and its animal&apos;s aggression level, at a glance — check this before sending anyone down a corridor.</p>

                <div className="metric-tiles">
                  {careMetrics.map((m) => (
                    <div className="metric-tile" key={m.key}>
                      <img src={m.icon} alt="" />
                      <strong>{m.value}%</strong>
                      <span>{m.sub}</span>
                      <p>{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="table-scroll" style={{ marginTop: 20 }}>
                  {kennelAnimals.length === 0 ? (
                    <p className="admin-empty">No kennel numbers assigned yet — set them from the Animals page.</p>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr><th>Kennel</th><th>Animal</th><th>Aggression Level</th><th>In-Charge</th></tr>
                      </thead>
                      <tbody>
                        {kennelAnimals.map((a) => (
                          <tr key={a.id}>
                            <td><strong>{a.kennelNumber}</strong></td>
                            <td>{a.name}</td>
                            <td>
                              {a.aggressionLevel ? (
                                <span className={`badge ${AGGRESSION_BADGE[a.aggressionLevel] || "badge-warning"}`}>{a.aggressionLevel}</span>
                              ) : (
                                <span className="badge badge-success">Not assessed</span>
                              )}
                            </td>
                            <td>{a.kennelInCharge || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-head"><h3>Animals by Type</h3></div>
                {totalAnimals === 0 ? (
                  <p className="admin-empty">No animals in the catalog yet.</p>
                ) : (
                  <div className="donut-chart-wrap">
                    <svg viewBox="0 0 100 100" className="donut-chart">
                      <defs>
                        <linearGradient id="donut-dog" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="color-mix(in srgb, var(--color-secondary) 55%, white)" />
                          <stop offset="100%" stopColor="var(--color-secondary)" />
                        </linearGradient>
                        <linearGradient id="donut-cat" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="color-mix(in srgb, var(--color-primary) 55%, white)" />
                          <stop offset="100%" stopColor="var(--color-primary)" />
                        </linearGradient>
                        <linearGradient id="donut-rabbit" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="color-mix(in srgb, var(--color-warning) 55%, white)" />
                          <stop offset="100%" stopColor="var(--color-warning)" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-cream)" strokeWidth="14" />
                      <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                      {speciesBreakdown.map((seg) => (
                        <circle
                          key={seg.species}
                          cx="50" cy="50" r="40" fill="none"
                          stroke={SPECIES_GRADIENT[seg.species] || seg.color}
                          strokeWidth="14"
                          strokeLinecap="round"
                          strokeDasharray={seg.dasharray}
                          strokeDashoffset={seg.dashoffset}
                          transform="rotate(-90 50 50)"
                        />
                      ))}
                    </svg>
                    <div className="donut-chart-center">
                      <strong>{totalAnimals}</strong>
                      <span>Total</span>
                    </div>
                  </div>
                )}
                <ul className="donut-legend">
                  {speciesBreakdown.map((seg) => (
                    <li key={seg.species}>
                      <span className="donut-legend-dot" style={{ background: seg.color }} />
                      {SPECIES_LABEL[seg.species] || seg.species}
                      <strong>{seg.count} ({seg.pct}%)</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="reports-grid">
              <div className="admin-card">
                <div className="admin-card-head">
                  <h3>Recent Booking Requests</h3>
                  <Link href="/admin/bookings" className="btn btn-ghost btn-sm">View all</Link>
                </div>
                {recentBookings.length === 0 ? (
                  <p className="admin-empty">No booking requests yet.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr><th>User</th><th>Animal</th><th>Activity</th><th>Date &amp; Time</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => (
                          <tr key={b.id}>
                            <td>
                              <div className="admin-user-cell">
                                <span className="admin-stat-icon" style={{ width: 38, height: 38, fontSize: "0.9rem" }}>{initials(b.name)}</span>
                                <div><strong>{b.name}</strong><span>{b.phone}</span></div>
                              </div>
                            </td>
                            <td>{b.petName}</td>
                            <td><ActivityLabel activity={b.activity} text={ACTIVITY_LABELS[b.activity] || b.activity} /></td>
                            <td>{formatDate(b.date)}<br /><span style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>{b.slot}</span></td>
                            <td>{b.duration || "—"}</td>
                            <td><span className={`badge ${badgeClassFor(b.status)}`}>{b.status}</span></td>
                            <td>
                              <div className="row-actions">
                                <BookingActionButtons status={b.status} onAction={(action) => handleBookingAction(b.id, action)} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="admin-card">
                <div className="admin-card-head"><h3>Quick Actions</h3></div>
                <div className="quick-actions-grid">
                  <Link href="/admin/animals" className="quick-action quick-action-primary"><img src="/icons/pets.png" alt="" /> Add New Animal</Link>
                  <Link href="/admin/bookings" className="quick-action"><img src="/icons/calendar.png" alt="" /> New Booking</Link>
                  <Link href="/admin/animals" className="quick-action"><img src="/icons/vaccinated.png" alt="" /> Health Check</Link>
                  <Link href="/admin/reports" className="quick-action"><img src="/icons/export.png" alt="" /> Generate Report</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
