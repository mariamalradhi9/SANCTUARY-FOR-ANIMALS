"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import ActivityLabel from "../ActivityLabel";
import type { Animal, HistoryEntry } from "@/lib/types";
import { getApplications, getBookings, latestActivityDate } from "@/lib/records";
import { badgeClassFor } from "@/lib/format";

const PET_ACTIVITY_LABELS: Record<string, string> = { walk: "Walk", play: "Playtime", groom: "Grooming" };

interface ActivityItem {
  title: ReactNode;
  subtitle: string;
  status: string;
  date: string;
  history: HistoryEntry[];
}

export default function PetActivity({ pet }: { pet: Animal }) {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const applications: ActivityItem[] = getApplications()
      .filter((app) => app.petId === pet.id)
      .map((app) => ({
        title: `Adoption Application — ${pet.name}`,
        subtitle: `Applicant: ${app.applicant} · Submitted ${app.date}`,
        status: app.status,
        date: app.date,
        history: app.history?.length ? app.history : [{ status: app.status, date: app.date }],
      }));
    const bookings: ActivityItem[] = getBookings()
      .filter((b) => b.petId === pet.id)
      .map((b) => ({
        title: <><ActivityLabel activity={b.activity} text={PET_ACTIVITY_LABELS[b.activity] || b.activity} /> with {pet.name}</>,
        subtitle: `${b.name} · ${b.date} at ${b.slot}${b.duration ? " · " + b.duration : ""}`,
        status: b.status,
        date: b.date,
        history: b.history?.length ? b.history : [{ status: b.status, date: b.date }],
      }));

    const combined = [...applications, ...bookings].sort((a, b) => (latestActivityDate(a) < latestActivityDate(b) ? 1 : -1));
    setItems(combined);
  }, [pet.id, pet.name]);

  if (items.length === 0) return null;

  return (
    <div className="pet-activity">
      <h3><img src="/icons/history.png" alt="" className="icon-img-md" /> Community Activity for {pet.name}</h3>
      {items.map((item, i) => (
        <details className="app-row-details" key={i}>
          <summary className="app-row">
            <div>
              <strong>{item.title}</strong>
              <p style={{ margin: "2px 0 0" }}>{item.subtitle}</p>
            </div>
            <span className={`badge ${badgeClassFor(item.status)}`}>{item.status}</span>
          </summary>
          <ul className="activity-timeline">
            {item.history.map((h, j) => (
              <li key={j}><span className={`badge ${badgeClassFor(h.status)}`}>{h.status}</span> <span className="activity-timeline-date">{h.date}</span></li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
