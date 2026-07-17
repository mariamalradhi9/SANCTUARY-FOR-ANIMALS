// Animals CRUD grid on admin-animals.html. Reads/writes via getAnimals()/saveAnimals()
// (js/pets-data.js), which every public page also reads from, so changes made here
// are reflected site-wide immediately.

const NO_PHOTO_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f7ead8"/><text x="100" y="82" font-size="48" text-anchor="middle">🐾</text></svg>'
);

let editingAnimalId = null;

document.addEventListener("DOMContentLoaded", () => {
  renderAnimalsGrid();
  document.getElementById("animalSearch").addEventListener("input", renderAnimalsGrid);
  document.getElementById("speciesFilter").addEventListener("change", renderAnimalsGrid);
  document.getElementById("availFilter").addEventListener("change", renderAnimalsGrid);
  document.getElementById("addAnimalBtn").addEventListener("click", () => openAnimalModal());
  document.getElementById("closeAnimalModal").addEventListener("click", closeAnimalModal);
  document.getElementById("animalModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "animalModalOverlay") closeAnimalModal();
  });
  document.getElementById("animalForm").addEventListener("submit", handleAnimalSave);
  document.getElementById("animalImgInput").addEventListener("change", handleAnimalPhotoUpload);
  document.getElementById("closeHistoryModal").addEventListener("click", closeHistoryModal);
  document.getElementById("historyModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "historyModalOverlay") closeHistoryModal();
  });
  bindConditionalFields();
});

function bindConditionalFields() {
  const toggle = (radioName, showValue, fieldEl) => {
    document.querySelectorAll(`input[name="${radioName}"]`).forEach((r) => {
      r.addEventListener("change", () => {
        fieldEl.style.display = r.checked && r.value === showValue ? "block" : "none";
      });
    });
  };
  toggle("govtSupport", "Yes", document.getElementById("govtSupportValueField"));
  toggle("trained", "Yes", document.getElementById("trainingDetailsFields"));

  document.getElementById("animalAdoptionType").addEventListener("change", (e) => {
    document.getElementById("destinationCountryField").style.display = e.target.value === "Abroad" ? "block" : "none";
  });
  document.getElementById("animalAdopterPaidFree").addEventListener("change", (e) => {
    document.getElementById("amountPaidField").style.display = e.target.value === "Paid" ? "block" : "none";
  });
}

function radioValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}
function setRadioValue(name, value) {
  const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function closeHistoryModal() {
  document.getElementById("historyModalOverlay").style.display = "none";
}

function openHistoryModal(petId) {
  const animal = getAnimals().find((a) => a.id === petId);
  if (!animal) return;

  const bookings = getBookings().filter((b) => b.petId === petId);
  const applications = getApplications().filter((a) => a.petId === petId);

  const currentlyOut = bookings
    .filter((b) => b.status === "Confirmed")
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];

  const events = [
    ...bookings.map((b) => ({
      date: b.date,
      text: `${ACTIVITY_LABELS[b.activity] || b.activity} with <strong>${b.name}</strong> (${b.slot}${b.duration ? ", " + b.duration : ""})`,
      status: b.status,
    })),
    ...applications.map((a) => ({
      date: a.date,
      text: a.status === "Approved"
        ? `🏡 Adopted by <strong>${a.applicant}</strong>`
        : `Adoption application from <strong>${a.applicant}</strong>`,
      status: a.status,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  document.getElementById("historyModalTitle").textContent = `${animal.name}'s History`;

  const currentBanner = currentlyOut
    ? `<div class="history-current-banner">📍 Currently with <strong>${currentlyOut.name}</strong> (${ACTIVITY_LABELS[currentlyOut.activity] || currentlyOut.activity}) since ${formatDate(currentlyOut.date)}</div>`
    : `<div class="history-current-banner history-current-banner-empty">🏠 ${animal.name} is currently at the sanctuary.</div>`;

  const timeline = events.length
    ? `<ul class="history-timeline">${events.map((e) => `
        <li>
          <span class="history-date">${formatDate(e.date)}</span>
          <span class="history-text">${e.text} <span class="badge ${badgeClassFor(e.status)}">${e.status}</span></span>
        </li>
      `).join("")}</ul>`
    : `<p class="admin-empty">No bookings or applications recorded for ${animal.name} yet.</p>`;

  document.getElementById("historyModalBody").innerHTML = currentBanner + timeline;
  document.getElementById("historyModalOverlay").style.display = "flex";
}

function handleAnimalPhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("animalImg").value = reader.result;
    document.getElementById("animalPhotoPreview").innerHTML = `<img src="${reader.result}" alt="Preview">`;
  };
  reader.readAsDataURL(file);
}

function animalCardHTML(a) {
  const tags = [a.gender === "male" ? "Male" : "Female", a.size ? a.size.charAt(0).toUpperCase() + a.size.slice(1) : ""].filter(Boolean);
  return `
    <div class="card animal-card" data-id="${a.id}">
      <div class="photo-wrap">
        <img src="${a.img || NO_PHOTO_IMG}" alt="${a.name}">
        <span class="animal-status-badge ${a.available !== false ? "available" : "unavailable"}">${a.available !== false ? "Available" : "Not Available"}</span>
      </div>
      <div class="info">
        <h3>${a.name}</h3>
        <div class="meta"><span>${a.species.charAt(0).toUpperCase() + a.species.slice(1)} · ${a.breed}</span> · <span>${a.age} ${a.age === 1 ? "year" : "years"}</span></div>
        <div class="animal-tags">${tags.map((t) => `<span>${t}</span>`).join("")}</div>
        <div class="animal-card-actions">
          <a href="pet-details.html?pet=${a.id}" class="btn btn-ghost" target="_blank">View</a>
          <button type="button" class="btn btn-outline" data-action="edit" data-id="${a.id}">Edit</button>
          <a href="admin-assessment.html?pet=${a.id}" class="btn btn-ghost">🩺 Assessment</a>
          <button type="button" class="btn btn-ghost" data-action="history" data-id="${a.id}">🕓 History</button>
          <button type="button" class="btn btn-ghost" data-action="delete" data-id="${a.id}" style="color:var(--color-danger); border-color:var(--color-danger);">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function renderAnimalsGrid() {
  const search = document.getElementById("animalSearch").value.trim().toLowerCase();
  const species = document.getElementById("speciesFilter").value;
  const avail = document.getElementById("availFilter").value;

  let list = getAnimals();
  if (search) list = list.filter((a) => a.name.toLowerCase().includes(search) || a.breed.toLowerCase().includes(search));
  if (species) list = list.filter((a) => a.species === species);
  if (avail === "available") list = list.filter((a) => a.available !== false);
  if (avail === "unavailable") list = list.filter((a) => a.available === false);

  const grid = document.getElementById("animalsGrid");
  if (list.length === 0) {
    grid.innerHTML = `<p class="admin-empty">No animals match your search.</p>`;
    return;
  }

  grid.innerHTML = list.map(animalCardHTML).join("");

  grid.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener("click", () => openAnimalModal(btn.dataset.id));
  });
  grid.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => handleAnimalDelete(btn.dataset.id));
  });
  grid.querySelectorAll('[data-action="history"]').forEach((btn) => {
    btn.addEventListener("click", () => openHistoryModal(btn.dataset.id));
  });
}

function openAnimalModal(id) {
  editingAnimalId = id || null;
  const form = document.getElementById("animalForm");
  form.reset();
  // Collapse all conditional sections; they're re-shown below if the loaded data warrants it.
  ["govtSupportValueField", "trainingDetailsFields", "destinationCountryField", "amountPaidField"].forEach((fid) => {
    document.getElementById(fid).style.display = "none";
  });

  if (id) {
    const a = getAnimals().find((x) => x.id === id);
    const adopter = a.adopter || {};
    document.getElementById("animalModalTitle").textContent = `Edit ${a.name}`;
    document.getElementById("animalId").value = a.id;
    document.getElementById("animalName").value = a.name;
    document.getElementById("animalSpecies").value = a.species;
    document.getElementById("animalBreed").value = a.breed;
    document.getElementById("animalAge").value = a.age;
    document.getElementById("animalSize").value = a.size;
    document.getElementById("animalGender").value = a.gender;
    document.getElementById("animalImg").value = a.img || "";
    document.getElementById("animalPhotoPreview").innerHTML = a.img ? `<img src="${a.img}" alt="Preview">` : "🐾";
    document.getElementById("animalDesc").value = a.desc || "";
    document.getElementById("animalAvailable").checked = a.available !== false;

    document.getElementById("animalOnboardingDate").value = a.onboardingDate || "";
    setRadioValue("govtSupport", a.govtSupport || "No");
    document.getElementById("animalGovtSupportValue").value = a.govtSupportValue || "";
    document.getElementById("govtSupportValueField").style.display = a.govtSupport === "Yes" ? "block" : "none";

    document.getElementById("animalAggressionLevel").value = a.aggressionLevel || "";
    document.getElementById("animalAggressionDetails").value = a.aggressionDetails || "";
    document.getElementById("animalBehaviorDetails").value = a.behaviorDetails || "";
    document.getElementById("animalMedicalStatus").value = a.medicalStatus || "Healthy";
    document.getElementById("animalVaccinationStatus").value = a.vaccinationStatus || "Up to Date";
    document.getElementById("animalNutritionStatus").value = a.nutritionStatus || "Good";
    document.getElementById("animalNextVetCheck").value = a.nextVetCheckDue || "";
    setRadioValue("chipped", a.chipped || "No");

    document.getElementById("animalKennelNumber").value = a.kennelNumber || "";
    document.getElementById("animalKennelInCharge").value = a.kennelInCharge || "";

    setRadioValue("trained", a.trained || "No");
    document.getElementById("animalTrainerName").value = a.trainerName || "";
    document.getElementById("animalTrainingHours").value = a.trainingHours || "";
    document.getElementById("animalTrainingLevel").value = a.trainingLevel || "Basic";
    document.getElementById("trainingDetailsFields").style.display = a.trained === "Yes" ? "block" : "none";

    setRadioValue("readyForAdoption", a.readyForAdoption || "No");
    document.getElementById("animalAdoptionDate").value = a.adoptionDate || "";
    document.getElementById("animalAdoptionType").value = a.adoptionType || "";
    document.getElementById("animalDestinationCountry").value = a.destinationCountry || "";
    document.getElementById("destinationCountryField").style.display = a.adoptionType === "Abroad" ? "block" : "none";

    document.getElementById("animalAdopterName").value = adopter.name || "";
    document.getElementById("animalAdopterMobile").value = adopter.mobile || "";
    document.getElementById("animalAdopterEmail").value = adopter.email || "";
    document.getElementById("animalAdopterAddress").value = adopter.address || "";
    document.getElementById("animalAdopterPaidFree").value = adopter.paidOrFree || "";
    document.getElementById("animalAdopterAmountPaid").value = adopter.amountPaid || "";
    document.getElementById("amountPaidField").style.display = adopter.paidOrFree === "Paid" ? "block" : "none";

    document.getElementById("animalRemarks").value = a.remarks || "";
  } else {
    document.getElementById("animalModalTitle").textContent = "Add Animal";
    document.getElementById("animalAvailable").checked = true;
    document.getElementById("animalImg").value = "";
    document.getElementById("animalPhotoPreview").innerHTML = "🐾";
    setRadioValue("govtSupport", "No");
    setRadioValue("chipped", "No");
    setRadioValue("trained", "No");
    setRadioValue("readyForAdoption", "No");
    document.getElementById("animalMedicalStatus").value = "Healthy";
    document.getElementById("animalVaccinationStatus").value = "Up to Date";
    document.getElementById("animalNutritionStatus").value = "Good";
  }

  document.getElementById("animalModalOverlay").style.display = "flex";
}

function closeAnimalModal() {
  document.getElementById("animalModalOverlay").style.display = "none";
}

function handleAnimalSave(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById("animalName").value.trim(),
    species: document.getElementById("animalSpecies").value,
    breed: document.getElementById("animalBreed").value.trim(),
    age: Number(document.getElementById("animalAge").value),
    size: document.getElementById("animalSize").value,
    gender: document.getElementById("animalGender").value,
    img: document.getElementById("animalImg").value.trim(),
    desc: document.getElementById("animalDesc").value.trim(),
    available: document.getElementById("animalAvailable").checked,

    onboardingDate: document.getElementById("animalOnboardingDate").value,
    govtSupport: radioValue("govtSupport") || "No",
    govtSupportValue: document.getElementById("animalGovtSupportValue").value ? Number(document.getElementById("animalGovtSupportValue").value) : null,

    aggressionLevel: document.getElementById("animalAggressionLevel").value,
    aggressionDetails: document.getElementById("animalAggressionDetails").value.trim(),
    behaviorDetails: document.getElementById("animalBehaviorDetails").value.trim(),
    medicalStatus: document.getElementById("animalMedicalStatus").value,
    vaccinationStatus: document.getElementById("animalVaccinationStatus").value,
    nutritionStatus: document.getElementById("animalNutritionStatus").value,
    nextVetCheckDue: document.getElementById("animalNextVetCheck").value,
    chipped: radioValue("chipped") || "No",

    kennelNumber: document.getElementById("animalKennelNumber").value.trim(),
    kennelInCharge: document.getElementById("animalKennelInCharge").value.trim(),

    trained: radioValue("trained") || "No",
    trainerName: document.getElementById("animalTrainerName").value.trim(),
    trainingHours: document.getElementById("animalTrainingHours").value ? Number(document.getElementById("animalTrainingHours").value) : null,
    trainingLevel: document.getElementById("animalTrainingLevel").value,

    readyForAdoption: radioValue("readyForAdoption") || "No",
    adoptionDate: document.getElementById("animalAdoptionDate").value,
    adoptionType: document.getElementById("animalAdoptionType").value,
    destinationCountry: document.getElementById("animalDestinationCountry").value.trim(),

    adopter: {
      name: document.getElementById("animalAdopterName").value.trim(),
      mobile: document.getElementById("animalAdopterMobile").value.trim(),
      email: document.getElementById("animalAdopterEmail").value.trim(),
      address: document.getElementById("animalAdopterAddress").value.trim(),
      paidOrFree: document.getElementById("animalAdopterPaidFree").value,
      amountPaid: document.getElementById("animalAdopterAmountPaid").value ? Number(document.getElementById("animalAdopterAmountPaid").value) : null,
    },

    remarks: document.getElementById("animalRemarks").value.trim(),
  };

  if (editingAnimalId) {
    updateAnimal(editingAnimalId, data);
    logAudit("animal-update", `${data.name}'s record was updated.`);
    showToast(`${data.name} updated.`);
  } else {
    data.id = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
    data.emoji = data.species === "dog" ? "🐶" : data.species === "cat" ? "🐱" : "🐰";
    data.tag = "New";
    addAnimal(data);
    logAudit("animal-onboarded", `${data.name} was onboarded into the catalog.`);
    showToast(`${data.name} added to the catalog.`);
  }

  closeAnimalModal();
  renderAnimalsGrid();
}

function handleAnimalDelete(id) {
  const a = getAnimals().find((x) => x.id === id);
  if (!a) return;
  if (!confirm(`Remove ${a.name} from the catalog? This can't be undone.`)) return;
  deleteAnimal(id);
  logAudit("animal-deleted", `${a.name} was removed from the catalog.`);
  showToast(`${a.name} removed.`);
  renderAnimalsGrid();
}
