// Shared helpers used across all standalone admin pages (admin.html, admin-animals.html,
// admin-bookings.html, admin-applications.html, admin-reports.html).

const ACTIVITY_LABELS = { walk: "🚶 Walk", play: "🎾 Playtime", groom: "🛁 Groom" };

function getApplications() {
  return JSON.parse(localStorage.getItem("pp_applications") || "[]");
}
function saveApplications(list) {
  localStorage.setItem("pp_applications", JSON.stringify(list));
}

function getBookings() {
  return JSON.parse(localStorage.getItem("pp_bookings") || "[]");
}
function saveBookings(list) {
  localStorage.setItem("pp_bookings", JSON.stringify(list));
}

function badgeClassFor(status) {
  if (status === "Approved" || status === "Confirmed" || status === "Completed") return "badge-success";
  if (status === "Declined" || status === "Cancelled") return "badge-danger";
  return "badge-warning";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 3200);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function pushHistory(entity, status) {
  if (!entity.history) entity.history = [];
  entity.history.push({ status, date: new Date().toISOString().slice(0, 10) });
}

// Lightweight audit trail: every staff action that changes a record is logged here so
// the sanctuary has a written record for inspections, complaints, or incident reviews.
function logAudit(action, summary) {
  const log = JSON.parse(localStorage.getItem("pp_audit_log") || "[]");
  log.push({ action, summary, at: new Date().toISOString() });
  localStorage.setItem("pp_audit_log", JSON.stringify(log));
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const then = new Date(dateStr + "T00:00:00");
  if (isNaN(then)) return null;
  return Math.floor((Date.now() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return daysSince(dateStr) > 0;
}

// ---- Session / logout (shared with main.js on the public side) ----

function getSession() {
  return JSON.parse(localStorage.getItem("pp_session") || "null");
}

function logout(redirectTo) {
  localStorage.removeItem("pp_session");
  window.location.href = redirectTo || "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutBtn")?.addEventListener("click", () => logout("login.html"));
});

function initialsAvatar(name) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return `<span class="admin-stat-icon" style="width:38px;height:38px;font-size:0.9rem;">${letter}</span>`;
}

function bookingActionsHTML(b) {
  if (b.status === "Requested") {
    return `<button class="round-btn round-btn-approve" data-action="confirm" data-id="${b.id}" title="Approve">✓</button>
            <button class="round-btn round-btn-reject" data-action="cancel" data-id="${b.id}" title="Reject">✕</button>`;
  }
  if (b.status === "Confirmed") {
    return `<button class="pill-btn" data-action="complete" data-id="${b.id}">Mark Completed</button>
            <button class="ghost-btn" data-action="reset-booking" data-id="${b.id}">↺ Reset</button>`;
  }
  return `<button class="ghost-btn" data-action="reset-booking" data-id="${b.id}">↺ Reset</button>`;
}

function bookingRowHTML(b) {
  return `
    <tr data-id="${b.id}">
      <td><div class="admin-user-cell">${initialsAvatar(b.name)}<div><strong>${b.name}</strong><span>${b.phone}</span></div></div></td>
      <td>${b.petName}</td>
      <td>${ACTIVITY_LABELS[b.activity] || b.activity}</td>
      <td>${formatDate(b.date)}<br><span style="color:var(--color-text-muted); font-size:0.78rem;">${b.slot}</span></td>
      <td>${b.duration || "—"}</td>
      <td><span class="badge ${badgeClassFor(b.status)}">${b.status}</span></td>
      <td><div class="row-actions">${bookingActionsHTML(b)}</div></td>
    </tr>
  `;
}

function bindBookingActions(container, onChange) {
  container.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bookings = getBookings();
      const b = bookings.find((x) => x.id === btn.dataset.id);
      if (!b) return;
      const action = btn.dataset.action;
      if (action === "confirm") b.status = "Confirmed";
      if (action === "cancel") b.status = "Cancelled";
      if (action === "complete") b.status = "Completed";
      if (action === "reset-booking") b.status = "Requested";
      pushHistory(b, b.status);
      saveBookings(bookings);
      logAudit("booking-status", `Booking for ${b.petName} (${b.name}) set to "${b.status}".`);
      showToast(`Booking for ${b.petName} marked as "${b.status}".`);
      onChange();
    });
  });
}

function applicationActionsHTML(a) {
  if (a.status === "Pending Review") {
    return `<button class="round-btn round-btn-approve" data-action="approve" data-id="${a.id}" title="Approve">✓</button>
            <button class="round-btn round-btn-reject" data-action="decline" data-id="${a.id}" title="Decline">✕</button>`;
  }
  return `<button class="ghost-btn" data-action="reset-application" data-id="${a.id}">↺ Reset</button>`;
}

function bindApplicationActions(container, onChange) {
  container.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const apps = getApplications();
      const a = apps.find((x) => x.id === btn.dataset.id);
      if (!a) return;
      const action = btn.dataset.action;
      if (action === "approve") a.status = "Approved";
      if (action === "decline") a.status = "Declined";
      if (action === "reset-application") a.status = "Pending Review";
      pushHistory(a, a.status);
      saveApplications(apps);
      logAudit("application-status", `Application for ${a.petName} (applicant: ${a.applicant}) set to "${a.status}".`);
      showToast(`Application for ${a.petName} marked as "${a.status}".`);
      onChange();
    });
  });
}
