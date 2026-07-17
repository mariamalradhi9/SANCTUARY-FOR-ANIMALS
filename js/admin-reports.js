// Reports/analytics on admin-reports.html — every figure here is computed live from
// pp_applications / pp_bookings in localStorage rather than hardcoded.

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

document.addEventListener("DOMContentLoaded", () => {
  renderStatCards();
  renderBarChart();
  renderNotes();
  renderCareAlerts();
  renderLOSTable();
  renderAuditTrail();
  document.getElementById("exportReportBtn").addEventListener("click", exportDonorReport);
});

function renderCareAlerts() {
  const animals = getAnimals();
  const alerts = [];

  animals.forEach((a) => {
    if (a.nextVetCheckDue && isOverdue(a.nextVetCheckDue)) {
      alerts.push({ level: "danger", text: `🚨 MANDATORY VET / NAIL TRIM CHECK OVERDUE for <strong>${a.name}</strong> — was due ${formatDate(a.nextVetCheckDue)} (${daysSince(a.nextVetCheckDue)} days ago).` });
    }
    if (a.medicalStatus === "Critical") {
      alerts.push({ level: "danger", text: `🚨 <strong>${a.name}</strong> has a Critical medical status — needs immediate attention.` });
    }
    if ((a.aggressionLevel === "High" || a.aggressionLevel === "Severe") && a.medicalStatus === "Under Treatment") {
      alerts.push({ level: "warning", text: `⚠️ <strong>${a.name}</strong> is ${a.aggressionLevel.toLowerCase()}-aggression and under treatment — plan a safe multi-person handling protocol.` });
    }
  });

  const el = document.getElementById("careAlerts");
  if (alerts.length === 0) {
    el.innerHTML = `<p class="admin-empty">No overdue care tasks right now — all animals are up to date.</p>`;
    return;
  }
  el.innerHTML = `<ul class="report-notes">${alerts.map((a) => `<li class="alert-${a.level}">${a.text}</li>`).join("")}</ul>`;
}

function renderLOSTable() {
  const animals = getAnimals()
    .filter((a) => a.onboardingDate)
    .map((a) => ({ ...a, los: daysSince(a.onboardingDate) }))
    .sort((a, b) => b.los - a.los);

  const el = document.getElementById("losTable");
  if (animals.length === 0) {
    el.innerHTML = `<p class="admin-empty">No onboarding dates recorded yet — add one from the Animals page to start tracking length of stay.</p>`;
    return;
  }

  el.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Animal</th><th>Onboarded</th><th>Days in Care</th><th>Status</th></tr></thead>
      <tbody>
        ${animals.map((a) => `
          <tr>
            <td>${a.name}</td>
            <td>${formatDate(a.onboardingDate)}</td>
            <td><strong>${a.los}</strong> days</td>
            <td>${a.los > 180
              ? `<span class="badge badge-danger">🚨 Long-term — push for adoption</span>`
              : `<span class="badge badge-success">On track</span>`}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

const AUDIT_ACTION_LABELS = {
  "animal-onboarded": "🐾 Animal Onboarded",
  "animal-update": "✏️ Animal Updated",
  "animal-deleted": "🗑️ Animal Removed",
  "assessment-saved": "🧠 Assessment Saved",
  "booking-status": "📅 Booking Status Changed",
  "application-status": "📄 Application Status Changed",
};

function renderAuditTrail() {
  const log = JSON.parse(localStorage.getItem("pp_audit_log") || "[]").slice().reverse().slice(0, 50);
  const el = document.getElementById("auditTrail");
  if (log.length === 0) {
    el.innerHTML = `<p class="admin-empty">No actions logged yet — the trail fills in as staff use the system.</p>`;
    return;
  }
  el.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>When</th><th>Action</th><th>Details</th></tr></thead>
      <tbody>
        ${log.map((entry) => `
          <tr>
            <td style="white-space:nowrap;">${new Date(entry.at).toLocaleString()}</td>
            <td style="white-space:nowrap;">${AUDIT_ACTION_LABELS[entry.action] || entry.action}</td>
            <td>${entry.summary}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function exportDonorReport() {
  const animals = getAnimals();
  const apps = getApplications();
  const bookings = getBookings();

  const headers = ["Name", "Species", "Breed", "Onboarding Date", "Days in Care", "Govt Support", "Govt Support Value (BD)", "Medical Status", "Vaccination Status", "Ready for Adoption", "Adoption Date", "Adoption Type", "Destination Country"];
  const rows = animals.map((a) => [
    a.name, a.species, a.breed, a.onboardingDate || "", a.onboardingDate ? daysSince(a.onboardingDate) : "",
    a.govtSupport || "No", a.govtSupportValue || "", a.medicalStatus || "", a.vaccinationStatus || "",
    a.readyForAdoption || "No", a.adoptionDate || "", a.adoptionType || "", a.destinationCountry || "",
  ]);

  const summaryLines = [
    [`Aamal Almoayyed Sanctuary — Donor / Grant Report`],
    [`Generated`, new Date().toLocaleString()],
    [`Total Animals`, animals.length],
    [`Adopted`, animals.filter((a) => a.readyForAdoption === "Yes" && a.adoptionDate).length],
    [`Total Adoption Applications`, apps.length],
    [`Total Visit Bookings`, bookings.length],
    [`Total Government Support Received (BD)`, animals.reduce((sum, a) => sum + (Number(a.govtSupportValue) || 0), 0).toFixed(3)],
    [],
    headers,
    ...rows,
  ];

  const csv = summaryLines.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aamal-almoayyed-donor-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  logAudit("report-exported", "Donor / grant CSV report exported.");
  showToast("Report downloaded.");
}

function renderStatCards() {
  const apps = getApplications();
  const bookings = getBookings();

  const decided = apps.filter((a) => a.status === "Approved" || a.status === "Declined");
  const approvalRate = decided.length ? Math.round((apps.filter((a) => a.status === "Approved").length / decided.length) * 100) : 0;
  document.getElementById("statApprovalRate").textContent = `${approvalRate}%`;
  document.getElementById("statApprovalSub").textContent = `${apps.filter((a) => a.status === "Approved").length} of ${decided.length} decided`;

  const walkCounts = {};
  bookings.filter((b) => b.activity === "walk").forEach((b) => {
    walkCounts[b.petName] = (walkCounts[b.petName] || 0) + 1;
  });
  const topWalked = Object.entries(walkCounts).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("statMostWalked").textContent = topWalked ? topWalked[0] : "—";
  document.getElementById("statMostWalkedSub").textContent = topWalked ? `${topWalked[1]} walk${topWalked[1] > 1 ? "s" : ""} logged` : "No walks yet";

  const cancelRate = bookings.length ? Math.round((bookings.filter((b) => b.status === "Cancelled").length / bookings.length) * 100) : 0;
  document.getElementById("statCancelRate").textContent = `${cancelRate}%`;

  const uniqueVisitors = new Set(bookings.map((b) => (b.name || "").trim().toLowerCase()).filter(Boolean)).size;
  document.getElementById("statVisitors").textContent = uniqueVisitors;
}

function renderBarChart() {
  const bookings = getBookings();
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_SHORT[d.getMonth()], count: 0 });
  }

  bookings.forEach((b) => {
    const d = new Date(b.date + "T00:00:00");
    const match = months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
    if (match) match.count += 1;
  });

  const max = Math.max(1, ...months.map((m) => m.count));
  const el = document.getElementById("bookingBarChart");
  el.innerHTML = `
    <div class="bar-chart-gridlines">
      <span></span><span></span><span></span><span></span>
    </div>
    ${months.map((m) => `
      <div class="bar-chart-col">
        <div class="bar-chart-bar-wrap">
          <span class="bar-chart-count">${m.count || ""}</span>
          <div class="bar-chart-bar ${m.count === 0 ? "zero" : ""} ${m.count === max && max > 0 ? "peak" : ""}" style="height:${m.count === 0 ? "4px" : Math.max(10, (m.count / max) * 100) + "%"};" title="${m.count} bookings"></div>
        </div>
        <span class="bar-chart-label">${m.label}</span>
      </div>
    `).join("")}
  `;
}

function renderNotes() {
  const bookings = getBookings();
  const apps = getApplications();
  const notes = [];

  if (bookings.length > 0) {
    const weekdayCounts = new Array(7).fill(0);
    bookings.forEach((b) => {
      const d = new Date(b.date + "T00:00:00");
      weekdayCounts[d.getDay()] += 1;
    });
    const peakDay = weekdayCounts.indexOf(Math.max(...weekdayCounts));
    notes.push(`${WEEKDAY_NAMES[peakDay]} receives the most visit requests.`);

    const petCounts = {};
    bookings.forEach((b) => { petCounts[b.petName] = (petCounts[b.petName] || 0) + 1; });
    const topPets = Object.entries(petCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([name]) => name);
    if (topPets.length) notes.push(`${topPets.join(" and ")} ${topPets.length > 1 ? "are" : "is"} the most requested for visits.`);
  } else {
    notes.push("No visit bookings recorded yet — insights will appear once visitors start booking.");
  }

  notes.push(`${apps.length} adoption application${apps.length === 1 ? "" : "s"} received in total.`);
  notes.push(`${bookings.length} visit booking${bookings.length === 1 ? "" : "s"} recorded in total.`);

  document.getElementById("operationalNotes").innerHTML = notes.map((n) => `<li>• ${n}</li>`).join("");
}
