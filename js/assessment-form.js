// Builds the temperament scoring table and handles save/print on assessment-form.html

const PROFILE_METRICS = [
  { key: "humanSociability", label: "Human Sociability", marker: "Tolerance for proximity; active solicitation of physical contact." },
  { key: "arousalThreshold", label: "Arousal Threshold", marker: "Speed of reaching high-excitement state." },
  { key: "recoveryLatency", label: "Recovery Latency", marker: "Time to return to baseline after stress." },
  { key: "environmentalConfidence", label: "Environmental Confidence", marker: "Reaction to novel surfaces, loud sounds and visual stimuli." },
  { key: "frustrationTolerance", label: "Frustration Tolerance", marker: "Response when a desired goal is withheld." },
  { key: "tactileSensitivity", label: "Tactile Sensitivity", marker: "Reaction to sudden or intrusive physical manipulation." },
];

let assessCurrentStep = 1;
const ASSESS_TOTAL_STEPS = 6;

document.addEventListener("DOMContentLoaded", () => {
  buildProfileTable();
  bindAssessStepNav();
  populateAnimalSelect();
  document.getElementById("printBtn").addEventListener("click", () => window.print());
  document.getElementById("assessmentForm").addEventListener("submit", handleSave);
});

function populateAnimalSelect() {
  const select = document.getElementById("assessAnimal");
  if (!select) return;
  select.innerHTML = `<option value="">Select an animal…</option>` +
    getAnimals().map((p) => `<option value="${p.id}">${p.name} — ${p.breed}</option>`).join("");
  select.addEventListener("change", () => loadAnimalIntoForm(select.value));

  const preselect = new URLSearchParams(window.location.search).get("pet");
  if (preselect && getAnimals().some((p) => p.id === preselect)) {
    select.value = preselect;
    loadAnimalIntoForm(preselect);
  }
}

function setRadio(form, name, value) {
  const input = value ? form.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`) : null;
  if (input) input.checked = true;
}

function setChecks(form, name, values) {
  (values || []).forEach((v) => {
    const input = form.querySelector(`input[name="${name}"][value="${CSS.escape(v)}"]`);
    if (input) input.checked = true;
  });
}

function loadAnimalIntoForm(petId) {
  const form = document.getElementById("assessmentForm");
  form.reset();
  document.getElementById("assessAnimal").value = petId;

  const animal = getAnimals().find((p) => p.id === petId);
  if (animal) document.getElementById("dogName").value = animal.name;
  if (!petId) return;

  const existing = getLatestAssessment(petId);
  if (!existing) return;

  document.getElementById("dogName").value = existing.dogName || (animal ? animal.name : "");
  document.getElementById("evalDate").value = existing.evalDate || "";
  document.getElementById("breedMix").value = existing.breedMix || "";
  document.getElementById("weightCondition").value = existing.weightCondition || "";
  document.getElementById("estAge").value = existing.estAge || "";
  document.getElementById("specialist").value = existing.specialist || "";
  document.getElementById("location").value = existing.location || "";
  setRadio(form, "sex", existing.sex);
  setRadio(form, "altered", existing.altered);
  setRadio(form, "vaccinated", existing.vaccinated);
  setRadio(form, "goodWithKids", existing.goodWithKids);

  PROFILE_METRICS.forEach((m) => {
    const select = form.querySelector(`select[name="score-${m.key}"]`);
    if (select) select.value = existing.profileScores?.[m.key] || "";
  });

  setRadio(form, "preyDrive", existing.preyDrive);
  setRadio(form, "foodDrive", existing.foodDrive);
  setRadio(form, "socialDrive", existing.socialDrive);

  setRadio(form, "socialOrientation", existing.socialOrientation);
  setChecks(form, "posturing", existing.posturing);
  setChecks(form, "spaceClaiming", existing.spaceClaiming);
  setRadio(form, "socialYield", existing.socialYield);

  setChecks(form, "redFlags", existing.redFlags);
  document.getElementById("incidentHistory").value = existing.incidentHistory || "";

  setRadio(form, "disposition", existing.disposition);
  setChecks(form, "orangeSubtype", existing.orangeSubtype);
  document.getElementById("signSpecialist").value = existing.signSpecialist || "";
  document.getElementById("signature").value = existing.signature || "";
  document.getElementById("signDate").value = existing.signDate || "";

  showToast(`Loaded existing assessment for ${existing.dogName || "this animal"} — editing in place.`);
}

function bindAssessStepNav() {
  document.querySelectorAll(".assess-step .next-step").forEach((btn) => {
    btn.addEventListener("click", () => goToAssessStep(assessCurrentStep + 1));
  });
  document.querySelectorAll(".assess-step .prev-step").forEach((btn) => {
    btn.addEventListener("click", () => goToAssessStep(assessCurrentStep - 1));
  });
}

function goToAssessStep(step) {
  if (step < 1 || step > ASSESS_TOTAL_STEPS) return;
  assessCurrentStep = step;

  document.querySelectorAll(".assess-step").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.step) === step);
  });
  document.querySelectorAll(".assess-stepper .step").forEach((el) => {
    const n = Number(el.dataset.step);
    el.classList.toggle("active", n === step);
    el.classList.toggle("done", n < step);
  });
  document.querySelectorAll(".assess-stepper .step-line").forEach((el, i) => {
    el.classList.toggle("done", i + 1 < step);
  });

  window.scrollTo({ top: document.querySelector(".assess-stepper").offsetTop - 100, behavior: "smooth" });
}

function buildProfileTable() {
  const body = document.getElementById("profileTableBody");
  body.innerHTML = PROFILE_METRICS.map((m) => `
    <tr>
      <td>${m.label}</td>
      <td>
        <select name="score-${m.key}" class="score-select">
          <option value="">–</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </td>
      <td class="marker-cell">${m.marker}</td>
    </tr>
  `).join("");
}

function checkedValues(form, name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);
}

function handleSave(e) {
  e.preventDefault();
  const form = e.target;
  const petId = document.getElementById("assessAnimal").value;
  if (!petId) {
    alert("Please select which animal this assessment is for.");
    document.getElementById("assessAnimal").focus();
    return;
  }

  const profileScores = {};
  PROFILE_METRICS.forEach((m) => {
    const val = form.querySelector(`select[name="score-${m.key}"]`)?.value || "";
    if (val) profileScores[m.key] = val;
  });

  const data = {
    petId,
    dogName: document.getElementById("dogName").value,
    evalDate: document.getElementById("evalDate").value,
    breedMix: document.getElementById("breedMix").value,
    weightCondition: document.getElementById("weightCondition").value,
    estAge: document.getElementById("estAge").value,
    specialist: document.getElementById("specialist").value,
    location: document.getElementById("location").value,
    sex: form.querySelector('input[name="sex"]:checked')?.value || "",
    altered: form.querySelector('input[name="altered"]:checked')?.value || "",
    vaccinated: form.querySelector('input[name="vaccinated"]:checked')?.value || "",
    goodWithKids: form.querySelector('input[name="goodWithKids"]:checked')?.value || "",
    profileScores,
    preyDrive: form.querySelector('input[name="preyDrive"]:checked')?.value || "",
    foodDrive: form.querySelector('input[name="foodDrive"]:checked')?.value || "",
    socialDrive: form.querySelector('input[name="socialDrive"]:checked')?.value || "",
    socialOrientation: form.querySelector('input[name="socialOrientation"]:checked')?.value || "",
    posturing: checkedValues(form, "posturing"),
    spaceClaiming: checkedValues(form, "spaceClaiming"),
    socialYield: form.querySelector('input[name="socialYield"]:checked')?.value || "",
    redFlags: checkedValues(form, "redFlags"),
    incidentHistory: document.getElementById("incidentHistory").value,
    disposition: form.querySelector('input[name="disposition"]:checked')?.value || "",
    orangeSubtype: checkedValues(form, "orangeSubtype"),
    signSpecialist: document.getElementById("signSpecialist").value,
    signature: document.getElementById("signature").value,
    signDate: document.getElementById("signDate").value,
    savedAt: new Date().toISOString(),
  };
  const assessments = JSON.parse(localStorage.getItem("pp_assessments") || "[]");
  const existingIndex = assessments.findIndex((a) => a.petId === petId);
  if (existingIndex > -1) assessments[existingIndex] = data;
  else assessments.push(data);
  localStorage.setItem("pp_assessments", JSON.stringify(assessments));
  logAudit("assessment-saved", `Behavioral assessment for ${data.dogName || "an animal"} was ${existingIndex > -1 ? "updated" : "recorded"} (disposition: ${data.disposition || "not set"}).`);

  const confirm = document.getElementById("saveConfirm");
  confirm.style.display = "block";
  setTimeout(() => { confirm.style.display = "none"; }, 4000);
  showToast(`Assessment for ${data.dogName || "animal"} saved and published.`);
}
