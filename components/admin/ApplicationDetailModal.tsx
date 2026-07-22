"use client";

import { useState } from "react";
import Modal from "../Modal";
import AnimalViewModal from "./AnimalViewModal";
import SchedulePickupModal from "./SchedulePickupModal";
import { getAnimals } from "@/lib/animals";
import { badgeClassFor, formatDate, formatTime12 } from "@/lib/format";
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
  const [scheduling, setScheduling] = useState(false);

  if (!application) return null;
  const animal = getAnimals().find((p) => p.id === application.petId);

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

      {onSchedulePickup && application.status === "Approved" && (
        <div className="app-detail-group">
          <h4>📅 Pickup</h4>
          <div className="summary-box" style={{ padding: 14 }}>
            {application.pickupDate && application.pickupTime ? (
              <div className="summary-row">
                <span>Scheduled for</span>
                <strong>{formatDate(application.pickupDate)} at {formatTime12(application.pickupTime)}</strong>
              </div>
            ) : (
              <div className="summary-row">
                <span>No pickup scheduled yet</span>
                <strong>—</strong>
              </div>
            )}
          </div>
          <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => setScheduling(true)}>
            {application.pickupDate ? "Reschedule Pickup" : "Schedule Pickup"}
          </button>
        </div>
      )}

      {animal && <AnimalViewModal animal={viewingAnimal ? animal : null} onClose={() => setViewingAnimal(false)} />}
      {onSchedulePickup && (
        <SchedulePickupModal
          open={scheduling}
          petName={application.petName}
          initialDate={application.pickupDate}
          initialTime={application.pickupTime}
          onConfirm={(d, t) => { onSchedulePickup(application.id, d, t); setScheduling(false); }}
          onCancel={() => setScheduling(false)}
        />
      )}
    </Modal>
  );
}
