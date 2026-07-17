// Tab switching + rendering activity/saved pets/profile photo on dashboard.html

let activeStatusFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  bindDashTabs();
  renderActivity();
  renderSavedPets();
  loadProfilePhoto();

  document.getElementById("activityFilter")?.addEventListener("change", renderActivity);
  document.getElementById("profilePhotoInput")?.addEventListener("change", handleProfilePhotoUpload);

  document.querySelectorAll("#statusFilterBar .status-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeStatusFilter = btn.dataset.status;
      document.querySelectorAll("#statusFilterBar .status-filter-btn").forEach((b) => b.classList.toggle("active", b === btn));
      renderActivity();
    });
  });

  document.getElementById("dashLogoutLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout("login.html");
  });
});

const STATUS_CATEGORY = {
  Approved: "accepted", Confirmed: "accepted", Completed: "accepted",
  Declined: "rejected", Cancelled: "rejected",
};
function statusCategoryFor(status) {
  return STATUS_CATEGORY[status] || "pending";
}

function latestActivityDate(item) {
  const dates = (item.history || []).map((h) => h.date).concat([item.date]);
  return dates.reduce((max, d) => (d > max ? d : max), item.date);
}

function bindDashTabs() {
  document.querySelectorAll(".dash-link[data-tab]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll(".dash-link").forEach((l) => l.classList.toggle("active", l === link));
      document.querySelectorAll(".dash-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === tab));
    });
  });
}

function badgeClassFor(status) {
  if (status === "Approved" || status === "Confirmed" || status === "Completed") return "badge-success";
  if (status === "Declined" || status === "Cancelled") return "badge-danger";
  return "badge-warning";
}

const ACTIVITY_LABELS = { walk: "🚶 Walk", play: "🎾 Playtime", groom: "🛁 Grooming" };

function renderActivity() {
  const filter = document.getElementById("activityFilter")?.value || "all";
  const applications = JSON.parse(localStorage.getItem("pp_applications") || "[]").map((app) => ({
    type: "application",
    date: app.date,
    title: `Adoption Application — ${app.petName}`,
    subtitle: `Applicant: ${app.applicant} · Submitted ${app.date}`,
    status: app.status,
    history: app.history || [{ status: app.status, date: app.date }],
  }));
  const bookings = JSON.parse(localStorage.getItem("pp_bookings") || "[]").map((b) => ({
    type: "booking",
    date: b.date,
    title: `${ACTIVITY_LABELS[b.activity] || b.activity} with ${b.petName}`,
    subtitle: `${b.date} at ${b.slot}${b.duration ? " · " + b.duration : ""}`,
    status: b.status,
    history: b.history || [{ status: b.status, date: b.date }],
  }));

  let combined = [...applications, ...bookings];
  if (filter !== "all") combined = combined.filter((item) => item.type === filter);
  if (activeStatusFilter !== "all") combined = combined.filter((item) => statusCategoryFor(item.status) === activeStatusFilter);
  combined.sort((a, b) => (latestActivityDate(a) < latestActivityDate(b) ? 1 : -1));

  const el = document.getElementById("activityList") || document.getElementById("applicationsList");
  if (!el) return;
  if (combined.length === 0) {
    el.innerHTML = `<p>Nothing here yet. <a href="search.html" style="color:var(--color-primary); font-weight:700;">Browse available pets →</a></p>`;
    return;
  }

  el.innerHTML = combined.map((item) => `
    <details class="app-row-details">
      <summary class="app-row">
        <div>
          <strong>${item.title}</strong>
          <p style="margin:2px 0 0;">${item.subtitle}</p>
        </div>
        <span class="badge ${badgeClassFor(item.status)}">${item.status}</span>
      </summary>
      <ul class="activity-timeline">
        ${item.history.map((h) => `<li><span class="badge ${badgeClassFor(h.status)}">${h.status}</span> <span class="activity-timeline-date">${h.date}</span></li>`).join("")}
      </ul>
    </details>
  `).join("");
}

function renderSavedPets() {
  const favIds = JSON.parse(localStorage.getItem("pp_favorites") || "[]");
  const el = document.getElementById("savedList");
  const favPets = getAnimals().filter((p) => favIds.includes(p.id));

  if (favPets.length === 0) {
    el.innerHTML = `<p>No saved pets yet. Tap the 🤍 on any pet card to save it here.</p>`;
    return;
  }

  el.innerHTML = favPets.map((pet) => `
    <div class="card pet-card">
      <div class="photo-wrap">
        <img src="${pet.img}" alt="${pet.name}">
        <button class="fav-btn active" data-pet-id="${pet.id}" aria-label="Remove">🤍</button>
      </div>
      <div class="info">
        <h3>${pet.name}</h3>
        <div class="meta"><span>${pet.breed}</span></div>
        <a href="pet-details.html?pet=${pet.id}" class="btn btn-outline">View Profile</a>
      </div>
    </div>
  `).join("");

  document.querySelectorAll("#savedList .fav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleFavorite(btn.dataset.petId);
      renderSavedPets();
    });
  });
}

function loadProfilePhoto() {
  const photo = localStorage.getItem("pp_profile_photo");
  if (!photo) return;
  const avatar = document.getElementById("dashAvatar") || document.querySelector(".dash-avatar");
  if (avatar) avatar.innerHTML = `<img src="${photo}" alt="Profile photo">`;
  const preview = document.getElementById("profilePhotoPreview");
  if (preview) preview.innerHTML = `<img src="${photo}" alt="Profile photo">`;
}

function handleProfilePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem("pp_profile_photo", reader.result);
    loadProfilePhoto();
  };
  reader.readAsDataURL(file);
}
