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

const STATUS_PILLS = ["Pending Review", "Approved", "Declined"] as const;

export default function AdminApplicationsPage() {
  usePageTitle("Adoption Applications — Admin — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
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
    let all = statusFilter ? applications.filter((a) => a.status === statusFilter) : applications;
    const q = search.trim().toLowerCase();
    if (q) all = all.filter((a) => a.applicant.toLowerCase().includes(q) || a.petName.toLowerCase().includes(q));
    return all.slice().reverse();
  }, [applications, statusFilter, search]);

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="applications" />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast${show ? " show" : ""}`}>{message}</div>

            <div className="admin-card unified-page-card">
              <div className="page-banner-strip">
                <div className="page-banner">
                  <div className="page-banner-copy">
                    <div className="page-banner-icon"><img src="/icons/documents.png" alt="" /></div>
                    <div>
                      <h1>Adoption Applications</h1>
                      <p>Review incoming adoption requests and update their status.</p>
                    </div>
                  </div>
                  <img className="page-banner-illustration" src="/img/application.png" alt="" />
                  <select className="page-banner-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="pill-filter-bar">
                <button type="button" className={`pill-filter-btn${statusFilter === "" ? " active" : ""}`} onClick={() => setStatusFilter("")}>
                  <img src="/icons/documents.png" alt="" /> All
                </button>
                {STATUS_PILLS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`pill-filter-btn${statusFilter === s ? " active" : ""}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s}
                  </button>
                ))}
                <input
                  type="text"
                  className="pill-filter-search"
                  placeholder="Search applications…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {list.length === 0 ? (
                <p className="admin-empty">No adoption applications match your filters.</p>
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
                                <button type="button" className="pill-btn" onClick={() => setViewing(a)}><img src="/icons/documents.png" alt="" className="icon-img-sm" /> View Details</button>
                                <ApplicationActionButtons status={a.status} onAction={(action) => handleAction(a.id, action)} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="tip-banner">
                <div className="tip-banner-icon"><img src="/icons/heart.png" alt="" /></div>
                <div className="tip-banner-copy">
                  <h4>Quick Tip</h4>
                  <p>Review applications promptly and schedule pickups as soon as you approve — adopters are waiting to bring their new companion home.</p>
                </div>
              </div>
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
