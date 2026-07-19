"use client";

import Modal from "../Modal";
import ActivityLabel from "../ActivityLabel";
import { getAnimals } from "@/lib/animals";
import { getApplications, getBookings } from "@/lib/records";
import { badgeClassFor, formatDate } from "@/lib/format";

const ACTIVITY_LABELS: Record<string, string> = { walk: "Walk", play: "Playtime", groom: "Groom" };

export default function AnimalHistoryModal({ petId, onClose }: { petId: string | null; onClose: () => void }) {
  if (!petId) return null;

  const animal = getAnimals().find((a) => a.id === petId);
  if (!animal) return null;

  const bookings = getBookings().filter((b) => b.petId === petId);
  const applications = getApplications().filter((a) => a.petId === petId);

  const currentlyOut = bookings
    .filter((b) => b.status === "Confirmed")
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];

  const events = [
    ...bookings.map((b) => ({
      date: b.date,
      node: <><ActivityLabel activity={b.activity} text={ACTIVITY_LABELS[b.activity] || b.activity} /> with <strong>{b.name}</strong> ({b.slot}{b.duration ? `, ${b.duration}` : ""})</>,
      status: b.status,
    })),
    ...applications.map((a) => ({
      date: a.date,
      node: a.status === "Approved" ? <>🏡 Adopted by <strong>{a.applicant}</strong></> : <>Adoption application from <strong>{a.applicant}</strong></>,
      status: a.status,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Modal title={`${animal.name}'s History`} onClose={onClose}>
      {currentlyOut ? (
        <div className="history-current-banner">
          📍 Currently with <strong>{currentlyOut.name}</strong> (<ActivityLabel activity={currentlyOut.activity} text={ACTIVITY_LABELS[currentlyOut.activity] || currentlyOut.activity} />) since {formatDate(currentlyOut.date)}
        </div>
      ) : (
        <div className="history-current-banner history-current-banner-empty"><img src="/icons/kennel.png" alt="" className="icon-img-sm" /> {animal.name} is currently at the sanctuary.</div>
      )}

      {events.length === 0 ? (
        <p className="admin-empty">No bookings or applications recorded for {animal.name} yet.</p>
      ) : (
        <ul className="history-timeline">
          {events.map((e, i) => (
            <li key={i}>
              <span className="history-date">{formatDate(e.date)}</span>
              <span className="history-text">{e.node} <span className={`badge ${badgeClassFor(e.status)}`}>{e.status}</span></span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
