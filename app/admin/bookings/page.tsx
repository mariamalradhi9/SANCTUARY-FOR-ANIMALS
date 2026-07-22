"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import BookingActionButtons from "@/components/admin/BookingActionButtons";
import ArrivalTimeModal from "@/components/admin/ArrivalTimeModal";
import BookingDetailModal from "@/components/admin/BookingDetailModal";
import ActivityLabel from "@/components/ActivityLabel";
import { getAnimals } from "@/lib/animals";
import { getBookings } from "@/lib/records";
import { applyBookingAction, setBookingArrivalTime, type BookingAction } from "@/lib/admin/bookingActions";
import { badgeClassFor, formatDate, formatTime12 } from "@/lib/format";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Animal, Booking } from "@/lib/types";

const ACTIVITY_LABELS: Record<string, string> = { walk: "Walk", play: "Playtime", groom: "Grooming" };
const ACTIVITY_ICONS: Record<string, string> = { walk: "/icons/walk.png", play: "/icons/paw.png", groom: "/icons/groom.png" };

function initials(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

const NO_PHOTO_IMG = "/icons/paw.png";

export default function AdminBookingsPage() {
  usePageTitle("Booking Requests — Admin — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState<"" | "walk" | "play" | "groom">("");
  const [search, setSearch] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [editingArrivalId, setEditingArrivalId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    setBookings(getBookings());
    setAnimals(getAnimals());
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
      showToast(`Booking for ${b.petName} confirmed — arrive by ${formatTime12(time)}.`);
    }
    setConfirmingId(null);
  }

  function handleUpdateArrival(time: string) {
    if (!editingArrivalId) return;
    const b = setBookingArrivalTime(editingArrivalId, time);
    if (b) {
      setBookings(getBookings());
      showToast(`Arrival time for ${b.petName}'s visit set to ${formatTime12(time)}.`);
    }
    setEditingArrivalId(null);
  }

  const confirmingBooking = useMemo(() => bookings.find((b) => b.id === confirmingId) || null, [bookings, confirmingId]);
  const editingArrivalBooking = useMemo(() => bookings.find((b) => b.id === editingArrivalId) || null, [bookings, editingArrivalId]);
  const viewingBooking = useMemo(() => bookings.find((b) => b.id === viewingId) || null, [bookings, viewingId]);

  function animalFor(b: Booking) {
    return animals.find((a) => a.id === b.petId);
  }

  const list = useMemo(() => {
    let all = statusFilter ? bookings.filter((b) => b.status === statusFilter) : bookings;
    if (activityFilter) all = all.filter((b) => b.activity === activityFilter);
    const q = search.trim().toLowerCase();
    if (q) all = all.filter((b) => b.name.toLowerCase().includes(q) || b.petName.toLowerCase().includes(q));
    return all.slice().reverse();
  }, [bookings, statusFilter, activityFilter, search]);

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="bookings" />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast${show ? " show" : ""}`}>{message}</div>

            <div className="admin-card page-banner">
              <div className="page-banner-copy">
                <div className="page-banner-icon"><img src="/icons/calendar.png" alt="" /></div>
                <div>
                  <h1>Booking Requests</h1>
                  <p>Review and manage all incoming walk, playtime and grooming bookings.</p>
                </div>
              </div>
              <img className="page-banner-illustration" src="/img/booking.png" alt="" />
              <select className="page-banner-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option value="Requested">Requested</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button type="button" className={`pill-filter-btn${activityFilter === "" ? " active" : ""}`} onClick={() => setActivityFilter("")}>
                  <img src="/icons/pets.png" alt="" /> All
                </button>
                {(["walk", "play", "groom"] as const).map((a) => (
                  <button
                    type="button"
                    key={a}
                    className={`pill-filter-btn${activityFilter === a ? " active" : ""}`}
                    onClick={() => setActivityFilter(a)}
                  >
                    <img src={ACTIVITY_ICONS[a]} alt="" /> {ACTIVITY_LABELS[a]}
                  </button>
                ))}
            </div>

            <div className="admin-card">
              <div className="pill-filter-bar">
                <input
                  type="text"
                  className="pill-filter-search"
                  placeholder="Search bookings…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {list.length === 0 ? (
                <p className="admin-empty">No booking requests match your filters.</p>
              ) : (
                <div className="table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Animal</th><th>Activity</th><th>Date &amp; Time</th><th>Requested By</th><th>Arrival Time</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {list.map((b) => {
                        const animal = animalFor(b);
                        return (
                          <tr key={b.id}>
                            <td>
                              <div className="admin-user-cell">
                                <img src={animal?.img || NO_PHOTO_IMG} alt={b.petName} />
                                <div><strong>{b.petName}</strong><span>{animal ? animal.species.charAt(0).toUpperCase() + animal.species.slice(1) : ""}</span></div>
                              </div>
                            </td>
                            <td><ActivityLabel activity={b.activity} text={ACTIVITY_LABELS[b.activity] || b.activity} /></td>
                            <td>{formatDate(b.date)}<br /><span style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>{b.slot}</span></td>
                            <td>
                              <div className="admin-user-cell">
                                <span className="admin-stat-icon" style={{ width: 38, height: 38, fontSize: "0.9rem" }}>{initials(b.name)}</span>
                                <div><strong>{b.name}</strong><span>{b.phone}</span></div>
                              </div>
                            </td>
                            <td>
                              {b.arrivalTime ? (
                                <div>
                                  <span>Arrive by {formatTime12(b.arrivalTime)}</span><br />
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
                                <button type="button" className="pill-btn" onClick={() => setViewingId(b.id)}><img src="/icons/documents.png" alt="" className="icon-img-sm" /> View Details</button>
                                <BookingActionButtons status={b.status} onAction={(action) => handleAction(b.id, action)} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-card tip-banner">
              <div className="tip-banner-icon"><img src="/icons/heart.png" alt="" /></div>
              <div className="tip-banner-copy">
                <h4>Quick Tip</h4>
                <p>Respond to booking requests promptly to provide the best experience for our visitors and ensure smooth operations.</p>
              </div>
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
      <BookingDetailModal booking={viewingBooking} animal={viewingBooking ? animalFor(viewingBooking) : undefined} onClose={() => setViewingId(null)} />
    </AuthGuard>
  );
}
