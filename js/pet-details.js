// Renders a single pet's profile on pet-details.html based on the ?pet= query param.

document.addEventListener("DOMContentLoaded", () => {
  const animals = getAnimals();
  const params = new URLSearchParams(window.location.search);
  const petId = params.get("pet") || animals[0].id;
  const pet = animals.find((p) => p.id === petId) || animals[0];
  window.currentPet = pet;
  renderPetDetail(pet);
  document.dispatchEvent(new CustomEvent("pet-loaded", { detail: pet }));
  bindSmartBack("search.html");

  document.getElementById("closeReportModal").addEventListener("click", closeBehavioralReportModal);
  document.getElementById("reportModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "reportModalOverlay") closeBehavioralReportModal();
  });
});

function closeBehavioralReportModal() {
  document.getElementById("reportModalOverlay").style.display = "none";
}

function openBehavioralReportModal(pet) {
  const latest = getLatestAssessment(pet.id);
  document.getElementById("reportModalTitle").textContent = `${pet.name}'s Behavioral Report`;
  document.getElementById("reportModalBody").innerHTML = renderBehavioralDetails(latest);
  document.getElementById("reportModalOverlay").style.display = "flex";
}

function renderPetDetail(pet) {
  document.title = `${pet.name} — Aamal Almoayyed Sanctuary`;

  const el = document.getElementById("petDetailContent");
  el.innerHTML = `
    <div class="detail-gallery">
      <img class="main-photo" src="${pet.img}" alt="${pet.name}">
    </div>

    <div class="detail-info">
      ${pet.tag ? `<span class="badge badge-info">${pet.tag}</span>` : ""}
      <h1>${pet.name}</h1>
      <p class="detail-sub">${pet.breed} · 📍 Manama, Bahrain</p>

      ${renderPetFacts(pet)}

      <h3>About ${pet.name}</h3>
      <p>${pet.desc}</p>

      ${renderBehavioralSummary(pet.id)}
      ${renderPetActivity(pet)}

      <div class="detail-actions">
        <a href="adopt.html?pet=${pet.id}" class="btn btn-primary">Start Adoption Application</a>
        <button class="fav-btn detail-fav" data-pet-id="${pet.id}" aria-label="Save">🤍 Save</button>
      </div>
    </div>
  `;
  initFavorites();

  const reportBtn = document.getElementById("viewBehavioralReportBtn");
  if (reportBtn) reportBtn.addEventListener("click", () => openBehavioralReportModal(pet));
}

const PET_ACTIVITY_LABELS = { walk: "🚶 Walk", play: "🎾 Playtime", groom: "🛁 Grooming" };

function petActivityBadgeClass(status) {
  if (status === "Approved" || status === "Confirmed" || status === "Completed") return "badge-success";
  if (status === "Declined" || status === "Cancelled") return "badge-danger";
  return "badge-warning";
}

function petActivityLatestDate(item) {
  const dates = (item.history || []).map((h) => h.date).concat([item.date]);
  return dates.reduce((max, d) => (d > max ? d : max), item.date);
}

function renderPetActivity(pet) {
  const applications = JSON.parse(localStorage.getItem("pp_applications") || "[]")
    .filter((app) => app.petId === pet.id)
    .map((app) => ({
      title: `Adoption Application — ${pet.name}`,
      subtitle: `Applicant: ${app.applicant} · Submitted ${app.date}`,
      status: app.status,
      date: app.date,
      history: app.history || [{ status: app.status, date: app.date }],
    }));
  const bookings = JSON.parse(localStorage.getItem("pp_bookings") || "[]")
    .filter((b) => b.petId === pet.id)
    .map((b) => ({
      title: `${PET_ACTIVITY_LABELS[b.activity] || b.activity} with ${pet.name}`,
      subtitle: `${b.name} · ${b.date} at ${b.slot}${b.duration ? " · " + b.duration : ""}`,
      status: b.status,
      date: b.date,
      history: b.history || [{ status: b.status, date: b.date }],
    }));

  const combined = [...applications, ...bookings].sort((a, b) => (petActivityLatestDate(a) < petActivityLatestDate(b) ? 1 : -1));
  if (combined.length === 0) return "";

  return `
    <div class="pet-activity">
      <h3>🕓 Community Activity for ${pet.name}</h3>
      ${combined.map((item) => `
        <details class="app-row-details">
          <summary class="app-row">
            <div>
              <strong>${item.title}</strong>
              <p style="margin:2px 0 0;">${item.subtitle}</p>
            </div>
            <span class="badge ${petActivityBadgeClass(item.status)}">${item.status}</span>
          </summary>
          <ul class="activity-timeline">
            ${item.history.map((h) => `<li><span class="badge ${petActivityBadgeClass(h.status)}">${h.status}</span> <span class="activity-timeline-date">${h.date}</span></li>`).join("")}
          </ul>
        </details>
      `).join("")}
    </div>
  `;
}
