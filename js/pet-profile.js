// Shared rendering of a pet's assessment-backed facts + behavioral profile.
// Used by both pet-details.html (full profile) and adopt.html (application sidebar).

function getLatestAssessment(petId) {
  const assessments = JSON.parse(localStorage.getItem("pp_assessments") || "[]").filter((a) => a.petId === petId);
  if (assessments.length === 0) return null;
  return assessments.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))[0];
}

function yesNoLabel(value, fallback) {
  if (value === "Y") return "Yes";
  if (value === "N") return "No";
  return fallback;
}

function renderPetFacts(pet) {
  const assessment = getLatestAssessment(pet.id);

  const ageLabel = pet.age < 1 ? `${Math.round(pet.age * 12)} months` : `${pet.age} years`;
  const sizeLabel = pet.size.charAt(0).toUpperCase() + pet.size.slice(1);
  const genderLabel = assessment?.sex ? (assessment.sex === "M" ? "Male" : "Female") : (pet.gender === "male" ? "Male" : "Female");
  const vaccinatedLabel = yesNoLabel(assessment?.vaccinated, "Yes");
  const neuteredLabel = yesNoLabel(assessment?.altered, "Yes");
  const goodWithKidsLabel = yesNoLabel(assessment?.goodWithKids, "Yes");
  const weightLabel = assessment?.weightCondition || "—";

  return `
    <div class="fact-grid">
      <div class="fact"><span class="fact-icon">🎂</span><div><strong>Age</strong><br>${ageLabel}</div></div>
      <div class="fact"><span class="fact-icon">📏</span><div><strong>Size</strong><br>${sizeLabel}</div></div>
      <div class="fact"><span class="fact-icon">⚥</span><div><strong>Gender</strong><br>${genderLabel}</div></div>
      <div class="fact"><span class="fact-icon">💉</span><div><strong>Vaccinated</strong><br>${vaccinatedLabel}</div></div>
      <div class="fact"><span class="fact-icon">✅</span><div><strong>Neutered</strong><br>${neuteredLabel}</div></div>
      <div class="fact"><span class="fact-icon">🧒</span><div><strong>Good with kids</strong><br>${goodWithKidsLabel}</div></div>
      <div class="fact"><span class="fact-icon">⚖️</span><div><strong>Weight</strong><br>${weightLabel}</div></div>
    </div>
  `;
}

const DISPOSITION_LEVEL_CLASS = {
  "Level 1 (Green)": "level-green",
  "Level 2 (Blue)": "level-blue",
  "Level 3 (Yellow)": "level-yellow",
  "Level 4 (Orange)": "level-orange",
  "Level 5 (Red)": "level-red",
};

const PROFILE_METRIC_LABELS = [
  ["humanSociability", "Human Sociability"],
  ["arousalThreshold", "Arousal Threshold"],
  ["recoveryLatency", "Recovery Latency"],
  ["environmentalConfidence", "Environmental Confidence"],
  ["frustrationTolerance", "Frustration Tolerance"],
  ["tactileSensitivity", "Tactile Sensitivity"],
];

function hasBehavioralDetails(latest) {
  if (!latest) return false;
  const scoreRows = PROFILE_METRIC_LABELS.filter(([key]) => latest.profileScores?.[key]);
  const hasDrives = latest.preyDrive || latest.foodDrive || latest.socialDrive;
  const hasDogToDog = latest.socialOrientation || (latest.posturing || []).length || (latest.spaceClaiming || []).length || latest.socialYield;
  const hasSafety = (latest.redFlags || []).length > 0 || !!latest.incidentHistory;
  return scoreRows.length > 0 || !!hasDrives || !!hasDogToDog || !!hasSafety;
}

function renderBehavioralDetails(latest) {
  if (!latest) return "";

  const scoreRows = PROFILE_METRIC_LABELS.filter(([key]) => latest.profileScores?.[key]);
  const drives = [
    ["Prey / Toy Drive", latest.preyDrive],
    ["Food Drive", latest.foodDrive],
    ["Social Drive", latest.socialDrive],
  ].filter(([, value]) => value);

  const dogToDog = [
    ["Social Orientation", latest.socialOrientation],
    ["Posturing", (latest.posturing || []).join(", ")],
    ["Space Claiming", (latest.spaceClaiming || []).join(", ")],
    ["Yields Space When Pressured", latest.socialYield || ""],
  ].filter(([, value]) => value);

  const hasRedFlags = (latest.redFlags || []).length > 0;
  const hasIncidents = !!latest.incidentHistory;

  return `
    ${scoreRows.length ? `
      <h4 class="sub-title">🧠 Temperament Profile (Scale 1–5: 1 = Minimal/Low, 5 = Intense/High Expression)</h4>
      <table class="profile-table">
        <thead><tr><th>Behavioral Metric</th><th>Score</th></tr></thead>
        <tbody>
          ${scoreRows.map(([key, label]) => `<tr><td>${label}</td><td><strong>${latest.profileScores[key]} / 5</strong></td></tr>`).join("")}
        </tbody>
      </table>
    ` : ""}

    ${drives.length ? `
      <h4 class="sub-title">⚡ Drive System Analysis (Motivation)</h4>
      <div class="behavior-traits">${drives.map(([label, value]) => `<div class="behavior-trait"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>
    ` : ""}

    ${dogToDog.length ? `
      <h4 class="sub-title">🐾 Dog-to-Dog Dynamics</h4>
      <div class="behavior-traits">${dogToDog.map(([label, value]) => `<div class="behavior-trait"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>
    ` : ""}

    ${hasRedFlags || hasIncidents ? `
      <h4 class="sub-title">⚠️ Safety Indicators &amp; Bite Log</h4>
      ${hasRedFlags ? `<div class="chip-list">${latest.redFlags.map((f) => `<span class="badge badge-danger">${f}</span>`).join("")}</div>` : ""}
      ${hasIncidents ? `<p style="margin-top:10px;">${latest.incidentHistory}</p>` : ""}
    ` : ""}
  `;
}

function renderBehavioralProfile(petId) {
  const latest = getLatestAssessment(petId);
  if (!latest) return "";

  const levelClass = DISPOSITION_LEVEL_CLASS[latest.disposition] || "";

  return `
    <div class="behavioral-profile">
      <h3>🐾 Behavioral Profile</h3>
      ${latest.disposition ? `<div class="disposition-option ${levelClass}" style="cursor:default;"><span><strong>${latest.disposition}</strong> — assessed by our sanctuary staff</span></div>` : ""}
      ${renderBehavioralDetails(latest)}
    </div>
  `;
}

// Compact teaser used on pet-details.html: disposition badge + a "View Full Report" trigger,
// with the heavy sections deferred to a modal (renderBehavioralDetails) instead of inlined.
function renderBehavioralSummary(petId) {
  const latest = getLatestAssessment(petId);
  if (!latest) return "";

  const levelClass = DISPOSITION_LEVEL_CLASS[latest.disposition] || "";
  const showReportBtn = hasBehavioralDetails(latest);

  return `
    <div class="behavioral-profile">
      <h3>🐾 Behavioral Profile</h3>
      ${latest.disposition ? `<div class="disposition-option ${levelClass}" style="cursor:default;"><span><strong>${latest.disposition}</strong> — assessed by our sanctuary staff</span></div>` : ""}
      ${showReportBtn ? `<button type="button" class="btn btn-outline btn-sm" id="viewBehavioralReportBtn" style="margin-top:14px;">📋 View Full Behavioral Report</button>` : ""}
    </div>
  `;
}
