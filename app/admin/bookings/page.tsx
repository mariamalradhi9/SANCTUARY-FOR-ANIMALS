"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import BookingActionButtons from "@/components/admin/BookingActionButtons";
import ArrivalTimeModal from "@/components/admin/ArrivalTimeModal";
import ActivityLabel from "@/components/ActivityLabel";
import { getBookings } from "@/lib/records";
import { applyBookingAction, setBookingArrivalTime, type BookingAction } from "@/lib/admin/bookingActions";
import { badgeClassFor, formatDate } from "@/lib/format";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Booking } from "@/lib/types";

const ACTIVITY_LABELS: Record<string, string> = { walk: "Walk", play: "Playtime", groom: "Groom" };

function initials(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

export default function AdminBookingsPage() {
  usePageTitle("Booking Requests — Admin — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [editingArrivalId, setEditingArrivalId] = useState<string | null>(null);

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  function handleAction(id: string, action: BookingAction) {
    if (action === "confirm") {
      setConfirmingId(id);
      return;
    }
    const b = applyBookingAction(id, action);
    if (!b) return;
    setBookings(getBookings());
    showToast(`Booking for ${b.petName} marked as "${b.status}".`);
  }

  function handleConfirmWithArrival(time: string) {
    if (!confirmingId) return;
    const b = applyBookingAction(confirmingId, "confirm");
    if (b) {
      setBookingArrivalTime(confirmingId, time);
      setBookings(getBookings());
      showToast(`Booking for ${b.petName} confirmed — arrive by ${time}.`);
    }
    setConfirmingId(null);
  }

  function handleUpdateArrival(time: string) {
    if (!editingArrivalId) return;
    const b = setBookingArrivalTime(editingArrivalId, time);
    if (b) {
      setBookings(getBookings());
      showToast(`Arrival time for ${b.petName}'s visit set to ${time}.`);
    }
    setEditingArrivalId(null);
  }

  const confirmingBooking = useMemo(() => bookings.find((b) => b.id === confirmingId) || null, [bookings, confirmingId]);
  const editingArrivalBooking = useMemo(() => bookings.find((b) => b.id === editingArrivalId) || null, [bookings, editingArrivalId]);

  const list = useMemo(() => {
    const all = statusFilter ? bookings.filter((b) => b.status === statusFilter) : bookings;
    return all.slice().reverse();
  }, [bookings, statusFilter]);

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="bookings" />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast${show ? " show" : ""}`}>{message}</div>

            <div className="admin-card">
              <div className="admin-card-head">
                <div>
                  <h3>Booking Requests</h3>
                  <p style={{ margin: "4px 0 0" }}>Approve, reject and track all animal walk, playtime and grooming bookings.</p>
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="Requested">Requested</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {list.length === 0 ? (
                <p className="admin-empty">No booking requests {statusFilter ? "with this status " : ""}yet.</p>
              ) : (
                <div className="table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr><th>User</th><th>Animal</th><th>Activity</th><th>Date &amp; Time</th><th>Arrival Time</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {list.map((b) => (
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
                          <td>
                            {b.arrivalTime ? (
                              <div>
                                <span>Arrive by {b.arrivalTime}</span><br />
                                <button type="button" className="btn btn-ghost btn-sm" style={{ padding: "2px 8px" }} onClick={() => setEditingArrivalId(b.id)}>Edit</button>
                              </div>
                            ) : b.status === "Requested" ? (
                              <span style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>Set on confirm</span>
                            ) : (
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingArrivalId(b.id)}>Set Arrival</button>
                            )}
                          </td>
                          <td>{b.duration || "—"}</td>
                          <td><span className={`badge ${badgeClassFor(b.status)}`}>{b.status}</span></td>
                          <td>
                            <div className="row-actions">
                              <BookingActionButtons status={b.status} onAction={(action) => handleAction(b.id, action)} />
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

      <ArrivalTimeModal
        open={!!confirmingBooking}
        petName={confirmingBooking?.petName || ""}
        confirmLabel="Confirm Booking"
        onConfirm={handleConfirmWithArrival}
        onCancel={() => setConfirmingId(null)}
      />
      <ArrivalTimeModal
        open={!!editingArrivalBooking}
        petName={editingArrivalBooking?.petName || ""}
        initialTime={editingArrivalBooking?.arrivalTime}
        confirmLabel="Save"
        onConfirm={handleUpdateArrival}
        onCancel={() => setEditingArrivalId(null)}
      />
    </AuthGuard>
  );
}
