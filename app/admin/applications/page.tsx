"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ApplicationActionButtons from "@/components/admin/ApplicationActionButtons";
import ApplicationDetailModal from "@/components/admin/ApplicationDetailModal";
import SchedulePickupModal from "@/components/admin/SchedulePickupModal";
import { getAnimals } from "@/lib/animals";
import { getApplications } from "@/lib/records";
import { applyApplicationAction, scheduleApplicationPickup, type ApplicationAction } from "@/lib/admin/bookingActions";
import { badgeClassFor, formatDate, formatTime12 } from "@/lib/format";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Application } from "@/lib/types";

function ApplicantAvatar({ app, size }: { app: Application; size: number }) {
  if (app.photo) {
    return <img src={app.photo} alt={app.applicant} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  const letter = (app.applicant || "?").trim().charAt(0).toUpperCase();
  return <span className="admin-stat-icon" style={{ width: size, height: size, fontSize: "0.9rem" }}>{letter}</span>;
}

export default function AdminApplicationsPage() {
  usePageTitle("Adoption Applications — Admin — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewing, setViewing] = useState<Application | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    setApplications(getApplications());
  }, []);

  const animals = useMemo(() => getAnimals(), []);
  const approvingApp = useMemo(() => applications.find((a) => a.id === approvingId) || null, [applications, approvingId]);

  function handleAction(id: string, action: ApplicationAction) {
    if (action === "approve") {
      setApprovingId(id);
      return;
    }
    const a = applyApplicationAction(id, action);
    if (!a) return;
    setApplications(getApplications());
    showToast(`Application for ${a.petName} marked as "${a.status}".`);
  }

  function handleConfirmApproval(pickupDate: string, pickupTime: string) {
    if (!approvingId) return;
    const a = applyApplicationAction(approvingId, "approve");
    if (a) {
      scheduleApplicationPickup(approvingId, pickupDate, pickupTime);
      setApplications(getApplications());
      showToast(`Application for ${a.petName} approved — pickup scheduled for ${pickupDate} at ${formatTime12(pickupTime)}.`);
    }
    setApprovingId(null);
  }

  function handleSchedulePickup(id: string, pickupDate: string, pickupTime: string) {
    const a = scheduleApplicationPickup(id, pickupDate, pickupTime);
    if (!a) return;
    setApplications(getApplications());
    setViewing(a);
    showToast(`Pickup for ${a.petName} scheduled for ${pickupDate} at ${formatTime12(pickupTime)}.`);
  }

  const list = useMemo(() => {
    const all = statusFilter ? applications.filter((a) => a.status === statusFilter) : applications;
    return all.slice().reverse();
  }, [applications, statusFilter]);

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="applications" />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast${show ? " show" : ""}`}>{message}</div>

            <div className="admin-card">
              <div className="admin-card-head">
                <div>
                  <h3>Adoption Applications</h3>
                  <p style={{ margin: "4px 0 0" }}>Review incoming adoption requests and update their status.</p>
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              {list.length === 0 ? (
                <p className="admin-empty">No adoption applications {statusFilter ? "with this status " : ""}yet.</p>
              ) : (
                <div className="table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Applicant</th><th>Pet</th><th>Submitted</th><th>Housing</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {list.map((a) => {
                        const animal = animals.find((p) => p.id === a.petId);
                        return (
                          <tr key={a.id}>
                            <td>
                              <div className="admin-user-cell">
                                <ApplicantAvatar app={a} size={38} />
                                <div><strong>{a.applicant}</strong><span>{a.email}</span></div>
                              </div>
                            </td>
                            <td>
                              <div className="admin-user-cell">
                                {animal && <img src={animal.img} alt={a.petName} />}
                                <div>{a.petName}</div>
                              </div>
                            </td>
                            <td>{formatDate(a.date)}</td>
                            <td>{a.housingType || "—"}</td>
                            <td><span className={`badge ${badgeClassFor(a.status)}`}>{a.status}</span></td>
                            <td>
                              <div className="row-actions">
                                <ApplicationActionButtons status={a.status} onAction={(action) => handleAction(a.id, action)} />
                                <button type="button" className="ghost-btn" onClick={() => setViewing(a)}>View</button>
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
          </div>
        </main>
      </div>

      <ApplicationDetailModal application={viewing} onClose={() => setViewing(null)} onSchedulePickup={handleSchedulePickup} />
      <SchedulePickupModal
        open={!!approvingApp}
        petName={approvingApp?.petName || ""}
        confirmLabel="Confirm Approval"
        onConfirm={handleConfirmApproval}
        onCancel={() => setApprovingId(null)}
      />
    </AuthGuard>
  );
}
