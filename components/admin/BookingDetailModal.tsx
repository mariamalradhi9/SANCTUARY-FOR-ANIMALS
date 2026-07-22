"use client";

import Modal from "../Modal";
import { badgeClassFor, formatDate, formatTime12 } from "@/lib/format";
import type { Animal, Booking } from "@/lib/types";

const ACTIVITY_LABELS: Record<string, string> = { walk: "Walk", play: "Playtime", groom: "Grooming" };

export default function BookingDetailModal({
  booking,
  animal,
  onClose,
}: {
  booking: Booking | null;
  animal?: Animal;
  onClose: () => void;
}) {
  if (!booking) return null;

  return (
    <Modal title="Booking Details" onClose={onClose}>
      <div className="app-detail-header">
        {animal && <img src={animal.img} alt={booking.petName} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />}
        <div>
          <h3>{booking.petName}</h3>
          <span className={`badge ${badgeClassFor(booking.status)}`}>{booking.status}</span>
        </div>
      </div>

      <div className="app-detail-group">
        <h4>Visitor</h4>
        <div className="summary-box">
          <div className="summary-row"><span>Name</span><strong>{booking.name}</strong></div>
          <div className="summary-row"><span>Phone</span><strong>{booking.phone}</strong></div>
        </div>
      </div>

      <div className="app-detail-group">
        <h4>Visit</h4>
        <div className="summary-box">
          <div className="summary-row"><span>Activity</span><strong>{ACTIVITY_LABELS[booking.activity] || booking.activity}</strong></div>
          <div className="summary-row"><span>Date</span><strong>{formatDate(booking.date)}</strong></div>
          <div className="summary-row"><span>Time Slot</span><strong>{booking.slot}</strong></div>
          <div className="summary-row"><span>Duration</span><strong>{booking.duration || "—"}</strong></div>
          <div className="summary-row"><span>Arrival Time</span><strong>{booking.arrivalTime ? formatTime12(booking.arrivalTime) : "Not set"}</strong></div>
        </div>
      </div>
    </Modal>
  );
}
