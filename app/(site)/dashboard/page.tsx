"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import FavButton from "@/components/site/FavButton";
import ActivityLabel from "@/components/ActivityLabel";
import { getAnimals } from "@/lib/animals";
import { getApplications, getBookings, latestActivityDate } from "@/lib/records";
import { getFavorites } from "@/lib/favorites";
import { badgeClassFor, statusCategoryFor } from "@/lib/format";
import { clearSession } from "@/lib/session";
import { readJSON, writeJSON } from "@/lib/storage";
import { usePageTitle } from "@/lib/usePageTitle";
import type { HistoryEntry } from "@/lib/types";

type Tab = "applications" | "saved" | "messages" | "settings";
type StatusFilter = "all" | "accepted" | "pending" | "rejected";

const ACTIVITY_LABELS: Record<string, string> = { walk: "Walk", play: "Playtime", groom: "Grooming" };

interface ActivityItem {
  type: "application" | "booking";
  date: string;
  title: ReactNode;
  subtitle: string;
  status: string;
  history: HistoryEntry[];
}

export default function DashboardPage() {
  usePageTitle("My Dashboard — Aamal Almoayyed Sanctuary");
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("applications");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const applications: ActivityItem[] = getApplications().map((app) => ({
      type: "application",
      date: app.date,
      title: `Adoption Application — ${app.petName}`,
      subtitle: `Applicant: ${app.applicant} · Submitted ${app.date}`,
      status: app.status,
      history: app.history?.length ? app.history : [{ status: app.status, date: app.date }],
    }));
    const bookings: ActivityItem[] = getBookings().map((b) => ({
      type: "booking",
      date: b.date,
      title: <><ActivityLabel activity={b.activity} text={ACTIVITY_LABELS[b.activity] || b.activity} /> with {b.petName}</>,
      subtitle: `${b.date} at ${b.slot}${b.duration ? " · " + b.duration : ""}`,
      status: b.status,
      history: b.history?.length ? b.history : [{ status: b.status, date: b.date }],
    }));
    setActivity([...applications, ...bookings].sort((a, b) => (latestActivityDate(a) < latestActivityDate(b) ? 1 : -1)));
    setFavIds(getFavorites());
    setProfilePhoto(readJSON<string | null>("pp_profile_photo", null));
  }, []);

  const filteredActivity = useMemo(() => {
    if (statusFilter === "all") return activity;
    return activity.filter((item) => statusCategoryFor(item.status) === statusFilter);
  }, [activity, statusFilter]);

  const animals = useMemo(() => getAnimals(), []);
  const savedPets = animals.filter((p) => favIds.includes(p.id));

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      writeJSON("pp_profile_photo", reader.result as string);
      setProfilePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <AuthGuard>
      <SiteHeader active="dashboard" />

      <section className="dashboard">
        <div className="container dashboard-grid">
          <aside className="dash-sidebar">
            <div className="dash-profile">
              <div className="dash-avatar">{profilePhoto ? <img src={profilePhoto} alt="Profile photo" /> : <img src="/icons/user.png" alt="" />}</div>
              <h3>Sarina Adams</h3>
              <p>sarina@example.com</p>
            </div>
            <ul className="dash-nav">
              <li><a href="#" className={`dash-link${tab === "applications" ? " active" : ""}`} onClick={(e) => { e.preventDefault(); setTab("applications"); }}><img src="/icons/documents.png" alt="" className="icon-img-sm" /> My Applications</a></li>
              <li><a href="#" className={`dash-link${tab === "saved" ? " active" : ""}`} onClick={(e) => { e.preventDefault(); setTab("saved"); }}><img src="/icons/heart.png" alt="" className="icon-img-sm" /> Saved Pets</a></li>
              <li><a href="#" className={`dash-link${tab === "messages" ? " active" : ""}`} onClick={(e) => { e.preventDefault(); setTab("messages"); }}><img src="/icons/message.png" alt="" className="icon-img-sm" /> Messages</a></li>
              <li><a href="#" className={`dash-link${tab === "settings" ? " active" : ""}`} onClick={(e) => { e.preventDefault(); setTab("settings"); }}><img src="/icons/setting.png" alt="" className="icon-img-sm" /> Settings</a></li>
            </ul>
            <ul className="dash-nav dash-nav-footer">
              <li>
                <a href="#" className="dash-link" onClick={(e) => { e.preventDefault(); clearSession(); router.push("/login"); }}><img src="/icons/logout.png" alt="" className="icon-img-sm" /> Logout</a>
              </li>
            </ul>
          </aside>

          <div className="dash-content">
            {tab === "applications" && (
              <div className="dash-panel active">
                <h2>My Applications</h2>
                <div className="status-filter-bar">
                  {(["all", "accepted", "pending", "rejected"] as StatusFilter[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`status-filter-btn${statusFilter === f ? " active" : ""}`}
                      onClick={() => setStatusFilter(f)}
                    >
                      {f === "all" ? "All" : f === "accepted" ? "✓ Accepted" : f === "pending" ? "⏳ Pending" : "✕ Rejected"}
                    </button>
                  ))}
                </div>
                <div>
                  {filteredActivity.length === 0 ? (
                    <p>Nothing here yet. <Link href="/search" style={{ color: "var(--color-primary)", fontWeight: 700 }}>Browse available pets →</Link></p>
                  ) : (
                    filteredActivity.map((item, i) => (
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
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "saved" && (
              <div className="dash-panel active">
                <h2>Saved Pets</h2>
                <div className="grid-3">
                  {savedPets.length === 0 ? (
                    <p>No saved pets yet. Tap the <img src="/icons/heart.png" alt="heart" className="icon-img-sm" /> on any pet card to save it here.</p>
                  ) : (
                    savedPets.map((pet) => (
                      <div className="card pet-card" key={pet.id}>
                        <div className="photo-wrap">
                          <img src={pet.img} alt={pet.name} />
                          <FavButton petId={pet.id} />
                        </div>
                        <div className="info">
                          <h3>{pet.name}</h3>
                          <div className="meta"><span>{pet.breed}</span></div>
                          <Link href={`/pet-details?pet=${pet.id}`} className="btn btn-outline">View Profile</Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "messages" && (
              <div className="dash-panel active">
                <h2>Messages</h2>
                <ul className="message-list">
                  <li className="message-item">
                    <div className="message-avatar">🏡</div>
                    <div>
                      <strong>Placement Team</strong>
                      <p>Thanks for your interest in Mochi! We&apos;d like to schedule a home visit — what does your week look like?</p>
                      <span className="message-date">2 days ago</span>
                    </div>
                  </li>
                  <li className="message-item">
                    <div className="message-avatar"><img src="/icons/assessment.png" alt="" /></div>
                    <div>
                      <strong>Vet Care Team</strong>
                      <p>A reminder that Biscuit&apos;s next check-up is coming up. Let us know if you&apos;d like to reschedule.</p>
                      <span className="message-date">1 week ago</span>
                    </div>
                  </li>
                </ul>
              </div>
            )}

            {tab === "settings" && (
              <div className="dash-panel active">
                <h2>Account Settings</h2>
                <div className="profile-photo-field">
                  <div className="profile-photo-preview">{profilePhoto ? <img src={profilePhoto} alt="Profile photo" /> : <img src="/icons/user.png" alt="" />}</div>
                  <div>
                    <label htmlFor="profilePhotoInput" className="btn btn-outline btn-sm">Upload Photo</label>
                    <input type="file" id="profilePhotoInput" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                    <p className="hint">JPG or PNG, shown on your profile.</p>
                  </div>
                </div>
                <div className="row-2">
                  <div className="field">
                    <label htmlFor="settingsName">Full Name</label>
                    <input type="text" id="settingsName" defaultValue="Sarina Adams" />
                  </div>
                  <div className="field">
                    <label htmlFor="settingsEmail">Email</label>
                    <input type="email" id="settingsEmail" defaultValue="sarina@example.com" />
                  </div>
                </div>
                <div className="field">
                  <label><input type="checkbox" defaultChecked style={{ width: "auto", marginRight: 8 }} />Email me about new pets matching my preferences</label>
                </div>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </AuthGuard>
  );
}
