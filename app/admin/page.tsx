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

function initials(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

export default function AdminDashboardPage() {
  usePageTitle("Admin Dashboard — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setAnimals(getAnimals());
    setBookings(getBookings());
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

            <div className="section-head admin-head">
              <span className="eyebrow">Admin Overview</span>
              <h1>Dashboard</h1>
              <p>Manage animals, assessments and visitor bookings from one workspace.</p>
            </div>

            <div className="admin-stats grid-4">
              <div className="admin-stat">
                <div className="admin-stat-head"><span>Total Animals</span><span className="admin-stat-icon"><img src="/icons/pets.png" alt="" /></span></div>
                <h2>{totalAnimals}</h2>
                <Link href="/admin/animals">View all animals →</Link>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-head"><span>Available for Walks</span><span className="admin-stat-icon"><img src="/icons/walk.png" alt="" /></span></div>
                <h2>{availableCount}</h2>
                <Link href="/admin/animals">View available →</Link>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-head"><span>Pending Bookings</span><span className="admin-stat-icon"><img src="/icons/calendar.png" alt="" /></span></div>
                <h2>{pendingBookings}</h2>
                <Link href="/admin/bookings">Review requests →</Link>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-head"><span>Completed This Month</span><span className="admin-stat-icon"><img src="/icons/check-clock.png" alt="" /></span></div>
                <h2>{completedThisMonth}</h2>
                <Link href="/admin/reports">View reports →</Link>
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

            <div className="admin-card">
              <div className="admin-card-head">
                <h3><img src="/icons/kennel.png" alt="" className="icon-img-md" /> Kennel Safety Overview</h3>
                <Link href="/admin/animals" className="btn btn-ghost btn-sm">Manage animals →</Link>
              </div>
              <p className="hint" style={{ marginBottom: 14 }}>Every kennel and its animal&apos;s aggression level, at a glance — check this before sending anyone down a corridor.</p>
              <div className="table-scroll">
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
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
