// Multi-step adoption application wizard on adopt.html

let currentStep = 1;
const TOTAL_STEPS = 3;

document.addEventListener("DOMContentLoaded", () => {
  populatePetChoice();
  bindStepNav();
  bindSmartBack("search.html");
  document.getElementById("petChoice").addEventListener("change", (e) => renderSidePetPreview(e.target.value));
  document.getElementById("adoptForm").addEventListener("submit", handleSubmit);
  document.getElementById("applicantPhotoInput").addEventListener("change", handleApplicantPhotoUpload);

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

function handleApplicantPhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("applicantPhoto").value = reader.result;
    document.getElementById("applicantPhotoPreview").innerHTML = `<img src="${reader.result}" alt="Your photo">`;
  };
  reader.readAsDataURL(file);
}

function populatePetChoice() {
  const select = document.getElementById("petChoice");
  select.innerHTML = getAnimals().map((p) => `<option value="${p.id}">${p.name} — ${p.breed}</option>`).join("");
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get("pet");
  if (preselect && getAnimals().some((p) => p.id === preselect)) select.value = preselect;
  renderSidePetPreview(select.value);
}

function renderSidePetPreview(petId) {
  const pet = getAnimals().find((p) => p.id === petId) || getAnimals()[0];
  const el = document.getElementById("sidePetPreview");
  el.innerHTML = `
    <img src="${pet.img}" alt="${pet.name}">
    <h3>${pet.name}</h3>
    <p>${pet.breed} · ${pet.age < 1 ? Math.round(pet.age * 12) + " mo" : pet.age + " yrs"}</p>
    ${renderPetFacts(pet)}
    ${renderBehavioralSummary(pet.id)}
  `;

  const reportBtn = document.getElementById("viewBehavioralReportBtn");
  if (reportBtn) reportBtn.addEventListener("click", () => openBehavioralReportModal(pet));
}

function bindStepNav() {
  document.querySelectorAll(".next-step").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    });
  });
  document.querySelectorAll(".prev-step").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(currentStep - 1));
  });
}

function validateStep(step) {
  const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  const requiredFields = stepEl.querySelectorAll("[required]");
  for (const field of requiredFields) {
    if (field.type === "radio") {
      const group = stepEl.querySelectorAll(`[name="${field.name}"]`);
      if (![...group].some((r) => r.checked)) {
        alert("Please complete all required fields before continuing.");
        return false;
      }
    } else if (!field.value.trim()) {
      field.focus();
      alert("Please complete all required fields before continuing.");
      return false;
    }
  }
  return true;
}

function goToStep(step) {
  if (step < 1 || step > TOTAL_STEPS) return;
  currentStep = step;

  document.querySelectorAll(".form-step").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.step) === step);
  });
  document.querySelectorAll(".step").forEach((el) => {
    const n = Number(el.dataset.step);
    el.classList.toggle("active", n === step);
    el.classList.toggle("done", n < step);
  });
  document.querySelectorAll(".step-line").forEach((el, i) => {
    el.classList.toggle("done", i + 1 < step);
  });

  if (step === 3) renderSummary();
  window.scrollTo({ top: document.querySelector(".stepper").offsetTop - 100, behavior: "smooth" });
}

function renderSummary() {
  const pet = getAnimals().find((p) => p.id === document.getElementById("petChoice").value);
  const gender = document.querySelector('input[name="gender"]:checked');
  const owned = document.querySelector('input[name="ownedBefore"]:checked');

  const rows = [
    ["Name", `${document.getElementById("firstName").value} ${document.getElementById("lastName").value}`],
    ["Email", document.getElementById("email").value],
    ["Phone", document.getElementById("phone").value],
    ["Gender", gender ? gender.value : "—"],
    ["Marital Status", document.getElementById("maritalStatus").value],
    ["Housing Type", document.getElementById("housingType").value],
    ["Applying For", pet ? `${pet.name} (${pet.breed})` : "—"],
    ["Owned a Pet Before", owned ? owned.value : "—"],
    ["Household Members", document.getElementById("householdSize").value],
  ];

  document.getElementById("summaryBox").innerHTML = rows.map(([label, value]) => `
    <div class="summary-row"><span>${label}</span><strong>${value || "—"}</strong></div>
  `).join("");
}

function handleSubmit(e) {
  e.preventDefault();
  if (!validateStep(3)) return;
  if (!document.getElementById("agreeTerms").checked) {
    alert("Please confirm the agreement checkbox to submit.");
    return;
  }

  const pet = getAnimals().find((p) => p.id === document.getElementById("petChoice").value);
  const gender = document.querySelector('input[name="gender"]:checked');
  const owned = document.querySelector('input[name="ownedBefore"]:checked');

  const applications = JSON.parse(localStorage.getItem("pp_applications") || "[]");
  applications.push({
    id: "app-" + Date.now(),
    petId: pet ? pet.id : "",
    petName: pet ? pet.name : "Unknown",
    applicant: `${document.getElementById("firstName").value} ${document.getElementById("lastName").value}`,
    photo: document.getElementById("applicantPhoto").value,
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    gender: gender ? gender.value : "",
    maritalStatus: document.getElementById("maritalStatus").value,
    housingType: document.getElementById("housingType").value,
    address: document.getElementById("address").value,
    ownedBefore: owned ? owned.value : "",
    householdSize: document.getElementById("householdSize").value,
    otherPets: document.getElementById("otherPets").value,
    whyAdopt: document.getElementById("whyAdopt").value,
    date: new Date().toISOString().slice(0, 10),
    status: "Pending Review",
    history: [{ status: "Pending Review", date: new Date().toISOString().slice(0, 10) }],
  });
  localStorage.setItem("pp_applications", JSON.stringify(applications));

  document.querySelector(".adopt-layout").style.display = "none";
  document.querySelector(".stepper").style.display = "none";
  document.getElementById("successBox").style.display = "block";
}
