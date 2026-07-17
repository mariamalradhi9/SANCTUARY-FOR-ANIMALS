"use client";

import Modal from "../Modal";
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

function DetailGroup({ title, rows }: { title: string; rows: [string, string | number | undefined][] }) {
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

export default function ApplicationDetailModal({ application, onClose }: { application: Application | null; onClose: () => void }) {
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

      <DetailGroup title="👤 Contact" rows={[
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
      <DetailGroup title="💬 Adoption Reason" rows={[
        ["Why Adopt", application.whyAdopt],
        ["Submitted", formatDate(application.date)],
      ]} />
    </Modal>
  );
}
