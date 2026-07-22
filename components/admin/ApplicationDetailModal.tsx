"use client";

import { useEffect, useState } from "react";
import Modal from "../Modal";
import AnimalViewModal from "./AnimalViewModal";
import { getAnimals } from "@/lib/animals";
import { badgeClassFor, formatDate } from "@/lib/format";
import type { Application } from "@/lib/types";

function ApplicantAvatar({ app, size }: { app: Application; size: number }) {
  if (app.photo) {
    return <img src={app.photo} alt={app.applicant} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  const letter = (app.applicant || "?").trim().charAt(0).toUpperCase();
  return <span className="admin-stat-icon" style={{ width: size, height: size, fontSize: size > 50 ? "1.4rem" : "0.9rem" }}>{letter}</span>;
}

function DetailGroup({ title, rows }: { title: React.ReactNode; rows: [string, string | number | undefined][] }) {
  return (
    <div className="app-detail-group">
      <h4>{title}</h4>
      <div className="summary-box">
        {rows.map(([label, value]) => (
          <div className="summary-row" key={label}>
            <span>{label}</span>
            <strong>{value || "—"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApplicationDetailModal({
  application,
  onClose,
  onSchedulePickup,
}: {
  application: Application | null;
  onClose: () => void;
  onSchedulePickup?: (id: string, pickupDate: string, pickupTime: string) => void;
}) {
  const [viewingAnimal, setViewingAnimal] = useState(false);
  const [pickupDate, setPickupDate] = useState(application?.pickupDate || "");
  const [pickupTime, setPickupTime] = useState(application?.pickupTime || "");

  useEffect(() => {
    setPickupDate(application?.pickupDate || "");
    setPickupTime(application?.pickupTime || "");
  }, [application?.id, application?.pickupDate, application?.pickupTime]);

  if (!application) return null;
  const animal = getAnimals().find((p) => p.id === application.petId);

  function savePickup() {
    if (!application || !pickupDate || !pickupTime) return;
    onSchedulePickup?.(application.id, pickupDate, pickupTime);
  }

  return (
    <Modal title="Application Details" onClose={onClose}>
      <div className="app-detail-header">
        <ApplicantAvatar app={application} size={64} />
        <div>
          <h3>{application.applicant}</h3>
          <span className={`badge ${badgeClassFor(application.status)}`}>{application.status}</span>
        </div>
        {animal && (
          <div className="app-detail-pet">
            <img src={animal.img} alt={application.petName} />
            <span>Applying for<br /><strong>{application.petName}</strong></span>
          </div>
        )}
      </div>

      {animal && (
        <button type="button" className="btn btn-outline btn-sm" style={{ marginBottom: 16 }} onClick={() => setViewingAnimal(true)}>
          View {application.petName}&apos;s Full Profile
        </button>
      )}

      <DetailGroup title={<><img src="/icons/user.png" alt="" className="icon-img-sm" /> Contact</>} rows={[
        ["Email", application.email],
        ["Phone", application.phone],
        ["Gender", application.gender],
        ["Marital Status", application.maritalStatus],
      ]} />
      <DetailGroup title="🏡 Household" rows={[
        ["Housing Type", application.housingType],
        ["Home Address", application.address],
        ["Owned a Pet Before", application.ownedBefore],
        ["Household Members", application.householdSize],
        ["Other Pets at Home", application.otherPets],
      ]} />
      <DetailGroup title={<><img src="/icons/message.png" alt="" className="icon-img-sm" /> Adoption Reason</>} rows={[
        ["Why Adopt", application.whyAdopt],
        ["Submitted", formatDate(application.date)],
      ]} />

      {onSchedulePickup && (
        <div className="app-detail-group">
          <h4>📅 Schedule Pickup</h4>
          <div className="summary-box" style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", padding: 14 }}>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="pickupDate">Date</label>
              <input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="pickupTime">Time</label>
              <input id="pickupTime" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={savePickup} disabled={!pickupDate || !pickupTime}>
              Save
            </button>
          </div>
          {application.pickupDate && application.pickupTime && (
            <p className="hint" style={{ marginTop: 8 }}>
              Currently scheduled: {formatDate(application.pickupDate)} at {application.pickupTime}
            </p>
          )}
        </div>
      )}

      {animal && <AnimalViewModal animal={viewingAnimal ? animal : null} onClose={() => setViewingAnimal(false)} />}
    </Modal>
  );
}
