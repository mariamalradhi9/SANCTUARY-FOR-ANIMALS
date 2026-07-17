// Full adoption applications table + detail modal on admin-applications.html

document.addEventListener("DOMContentLoaded", () => {
  renderApplicationsTable();
  document.getElementById("statusFilter").addEventListener("change", renderApplicationsTable);
  document.getElementById("closeAppModal").addEventListener("click", closeAppModal);
  document.getElementById("appModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "appModalOverlay") closeAppModal();
  });
});

function closeAppModal() {
  document.getElementById("appModalOverlay").style.display = "none";
}

function applicantAvatarHTML(a, size) {
  if (a.photo) return `<img src="${a.photo}" alt="${a.applicant}" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover;">`;
  return initialsAvatar(a.applicant);
}

function applicationRowHTML(a) {
  const animal = getAnimals().find((p) => p.id === a.petId);
  return `
    <tr data-id="${a.id}">
      <td><div class="admin-user-cell">${applicantAvatarHTML(a, 38)}<div><strong>${a.applicant}</strong><span>${a.email}</span></div></div></td>
      <td><div class="admin-user-cell">${animal ? `<img src="${animal.img}" alt="${a.petName}">` : ""}<div>${a.petName}</div></div></td>
      <td>${formatDate(a.date)}</td>
      <td>${a.housingType || "—"}</td>
      <td><span class="badge ${badgeClassFor(a.status)}">${a.status}</span></td>
      <td>
        <div class="row-actions">
          ${applicationActionsHTML(a)}
          <button class="ghost-btn" data-action="view" data-id="${a.id}">View</button>
        </div>
      </td>
    </tr>
  `;
}

function renderApplicationsTable() {
  const filter = document.getElementById("statusFilter").value;
  const all = getApplications();
  const list = filter ? all.filter((a) => a.status === filter) : all;
  const el = document.getElementById("applicationsTable");

  if (list.length === 0) {
    el.innerHTML = `<p class="admin-empty">No adoption applications ${filter ? "with this status " : ""}yet.</p>`;
    return;
  }

  el.innerHTML = `
    <div class="table-scroll">
    <table class="admin-table">
      <thead>
        <tr><th>Applicant</th><th>Pet</th><th>Submitted</th><th>Housing</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>${list.slice().reverse().map(applicationRowHTML).join("")}</tbody>
    </table>
    </div>
  `;

  bindApplicationActions(el, renderApplicationsTable);
  el.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener("click", () => openAppModal(btn.dataset.id));
  });
}

function appDetailGroup(title, rows) {
  return `
    <div class="app-detail-group">
      <h4>${title}</h4>
      <div class="summary-box">
        ${rows.map(([label, value]) => `<div class="summary-row"><span>${label}</span><strong>${value || "—"}</strong></div>`).join("")}
      </div>
    </div>
  `;
}

function openAppModal(appId) {
  const a = getApplications().find((x) => x.id === appId);
  if (!a) return;
  const animal = getAnimals().find((p) => p.id === a.petId);

  document.getElementById("appModalBody").innerHTML = `
    <div class="app-detail-header">
      ${applicantAvatarHTML(a, 64)}
      <div>
        <h3>${a.applicant}</h3>
        <span class="badge ${badgeClassFor(a.status)}">${a.status}</span>
      </div>
      ${animal ? `<div class="app-detail-pet"><img src="${animal.img}" alt="${a.petName}"><span>Applying for<br><strong>${a.petName}</strong></span></div>` : ""}
    </div>

    ${appDetailGroup("👤 Contact", [
      ["Email", a.email],
      ["Phone", a.phone],
      ["Gender", a.gender],
      ["Marital Status", a.maritalStatus],
    ])}
    ${appDetailGroup("🏡 Household", [
      ["Housing Type", a.housingType],
      ["Home Address", a.address],
      ["Owned a Pet Before", a.ownedBefore],
      ["Household Members", a.householdSize],
      ["Other Pets at Home", a.otherPets],
    ])}
    ${appDetailGroup("💬 Adoption Reason", [
      ["Why Adopt", a.whyAdopt],
      ["Submitted", formatDate(a.date)],
    ])}
  `;
  document.getElementById("appModalOverlay").style.display = "flex";
}
