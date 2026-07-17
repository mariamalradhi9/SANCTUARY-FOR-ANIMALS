// Stats + recent bookings preview for the admin Dashboard overview (admin.html).

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderRecentBookings();
  renderDashCareAlerts();
  renderKennelOverview();
});

function renderDashCareAlerts() {
  const animals = getAnimals();
  const alerts = [];
  animals.forEach((a) => {
    if (a.nextVetCheckDue && isOverdue(a.nextVetCheckDue)) {
      alerts.push(`🚨 MANDATORY VET / NAIL TRIM CHECK OVERDUE for <strong>${a.name}</strong> (${daysSince(a.nextVetCheckDue)} days overdue).`);
    }
    if (a.medicalStatus === "Critical") {
      alerts.push(`🚨 <strong>${a.name}</strong> has a Critical medical status.`);
    }
  });

  const card = document.getElementById("dashAlertsCard");
  if (alerts.length === 0) {
    card.style.display = "none";
    return;
  }
  card.style.display = "block";
  document.getElementById("dashCareAlerts").innerHTML = `<ul class="report-notes">${alerts.map((a) => `<li class="alert-danger">${a}</li>`).join("")}</ul>`;
}

const AGGRESSION_BADGE = { Low: "badge-success", Medium: "badge-warning", High: "badge-danger", Severe: "badge-danger" };

function renderKennelOverview() {
  const animals = getAnimals().filter((a) => a.kennelNumber);
  const el = document.getElementById("kennelOverview");

  if (animals.length === 0) {
    el.innerHTML = `<p class="admin-empty">No kennel numbers assigned yet — set them from the Animals page.</p>`;
    return;
  }

  const sorted = animals.slice().sort((a, b) => (a.kennelNumber || "").localeCompare(b.kennelNumber || ""));
  el.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Kennel</th><th>Animal</th><th>Aggression Level</th><th>In-Charge</th></tr></thead>
      <tbody>
        ${sorted.map((a) => `
          <tr>
            <td><strong>${a.kennelNumber}</strong></td>
            <td>${a.name}</td>
            <td>${a.aggressionLevel ? `<span class="badge ${AGGRESSION_BADGE[a.aggressionLevel] || "badge-warning"}">${a.aggressionLevel}</span>` : `<span class="badge badge-success">Not assessed</span>`}</td>
            <td>${a.kennelInCharge || "—"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderStats() {
  const animals = getAnimals();
  const bookings = getBookings();

  document.getElementById("statTotalAnimals").textContent = animals.length;
  document.getElementById("statAvailable").textContent = animals.filter((a) => a.available !== false).length;
  document.getElementById("statPendingBookings").textContent = bookings.filter((b) => b.status === "Requested").length;

  const now = new Date();
  const completedThisMonth = bookings.filter((b) => {
    if (b.status !== "Completed") return false;
    const d = new Date(b.date + "T00:00:00");
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById("statCompleted").textContent = completedThisMonth;
}

function renderRecentBookings() {
  const bookings = getBookings().slice().reverse().slice(0, 5);
  const el = document.getElementById("recentBookings");

  if (bookings.length === 0) {
    el.innerHTML = `<p class="admin-empty">No booking requests yet.</p>`;
    return;
  }

  el.innerHTML = `
    <div class="table-scroll">
    <table class="admin-table">
      <thead>
        <tr><th>User</th><th>Animal</th><th>Activity</th><th>Date &amp; Time</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>${bookings.map(bookingRowHTML).join("")}</tbody>
    </table>
    </div>
  `;

  bindBookingActions(el, () => {
    renderStats();
    renderRecentBookings();
  });
}
