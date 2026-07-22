"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ScoreScale from "@/components/admin/ScoreScale";
import { getAnimals } from "@/lib/animals";
import { getLatestAssessment, saveAssessment } from "@/lib/records";
import { logAudit } from "@/lib/admin/audit";
import { ageLabel, formatDate } from "@/lib/format";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Assessment } from "@/lib/types";

const TOTAL_STEPS = 6;

const STEPS: { n: number; icon: React.ReactNode; label: string }[] = [
  { n: 1, icon: <img src="/icons/pets.png" alt="" />, label: "Intake" },
  { n: 2, icon: <img src="/icons/user.png" alt="" />, label: "Profiling" },
  { n: 3, icon: <img src="/icons/drives.png" alt="" />, label: "Drives" },
  { n: 4, icon: <img src="/icons/paw.png" alt="" />, label: "Dog-to-Dog" },
  { n: 5, icon: <img src="/icons/alarm.png" alt="" />, label: "Safety" },
  { n: 6, icon: <img src="/icons/disposition.png" alt="" />, label: "Disposition" },
];

type FormState = Omit<Assessment, "petId" | "savedAt">;

const EMPTY_FORM: FormState = {
  dogName: "", evalDate: "", breedMix: "", weightCondition: "", dob: "", specialist: "", location: "",
  sex: "", altered: "", vaccinated: "", goodWithKids: "",
  profileScores: {},
  preyDrive: "", foodDrive: "", socialDrive: "",
  socialOrientation: "", posturing: [], spaceClaiming: [], socialYield: "",
  redFlags: [], incidentHistory: "",
  disposition: "", orangeSubtype: [],
  signSpecialist: "", signature: "", signDate: "",
};

function fromAssessment(a: Assessment, fallbackName: string): FormState {
  return {
    dogName: a.dogName || fallbackName, evalDate: a.evalDate || "", breedMix: a.breedMix || "",
    weightCondition: a.weightCondition || "", dob: a.dob || "", specialist: a.specialist || "", location: a.location || "",
    sex: a.sex || "", altered: a.altered || "", vaccinated: a.vaccinated || "", goodWithKids: a.goodWithKids || "",
    profileScores: a.profileScores || {},
    preyDrive: a.preyDrive || "", foodDrive: a.foodDrive || "", socialDrive: a.socialDrive || "",
    socialOrientation: a.socialOrientation || "", posturing: a.posturing || [], spaceClaiming: a.spaceClaiming || [], socialYield: a.socialYield || "",
    redFlags: a.redFlags || [], incidentHistory: a.incidentHistory || "",
    disposition: a.disposition || "", orangeSubtype: a.orangeSubtype || [],
    signSpecialist: a.signSpecialist || "", signature: a.signature || "", signDate: a.signDate || "",
  };
}

function toggleArr(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

const STEP_REQUIRED_FIELDS: Record<number, (keyof FormState)[]> = {
  1: ["dogName", "evalDate", "breedMix", "weightCondition", "sex", "altered", "vaccinated", "goodWithKids", "specialist", "location"],
  3: ["preyDrive", "foodDrive", "socialDrive"],
  4: ["socialOrientation", "socialYield"],
  5: ["incidentHistory"],
  6: ["disposition", "signSpecialist", "signature", "signDate"],
};

function validateStep(n: number, form: FormState): Set<string> {
  const invalid = new Set<string>();
  (STEP_REQUIRED_FIELDS[n] || []).forEach((key) => {
    const val = form[key];
    if (typeof val === "string" && !val.trim()) invalid.add(key);
  });
  if (n === 2) {
    PROFILE_METRIC_MARKERS.forEach(({ key }) => {
      if (!form.profileScores[key]) invalid.add(`profileScores.${key}`);
    });
  }
  return invalid;
}

function AssessmentPageInner() {
  usePageTitle("Behavioral Assessment — Admin — Aamal Almoayyed Sanctuary");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message, show, showToast } = useToast();
  const stepperRef = useRef<HTMLDivElement>(null);

  const animals = getAnimals();
  const [petId, setPetId] = useState("");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const selectedAnimal = animals.find((p) => p.id === petId);
  function fieldClass(base: string, key: string) {
    return errors.has(key) ? `${base} field-error` : base;
  }

  useEffect(() => {
    const preselect = searchParams.get("pet");
    if (preselect && animals.some((p) => p.id === preselect)) {
      loadAnimal(preselect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadAnimal(id: string) {
    setPetId(id);
    const animal = animals.find((p) => p.id === id);
    if (!id) {
      setForm(EMPTY_FORM);
      return;
    }
    const existing = getLatestAssessment(id);
    if (existing) {
      setForm(fromAssessment(existing, animal?.name || ""));
      showToast(`Loaded existing assessment for ${existing.dogName || "this animal"} — editing in place.`);
    } else {
      setForm({ ...EMPTY_FORM, dogName: animal?.name || "" });
    }
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => {
      if (!prev.has(key as string)) return prev;
      const next = new Set(prev);
      next.delete(key as string);
      return next;
    });
  }

  function goToStep(n: number) {
    if (n < 1 || n > TOTAL_STEPS) return;
    if (n > step) {
      const invalid = validateStep(step, form);
      if (invalid.size > 0) {
        setErrors(invalid);
        showToast("Please fill in all required fields before continuing.");
        return;
      }
    }
    setErrors(new Set());
    setStep(n);
    if (stepperRef.current) {
      window.scrollTo({ top: stepperRef.current.offsetTop - 100, behavior: "smooth" });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!petId) {
      alert("Please select which animal this assessment is for.");
      return;
    }
    const invalid = validateStep(6, form);
    if (invalid.size > 0) {
      setErrors(invalid);
      showToast("Please fill in all required fields before saving.");
      return;
    }

    const data: Assessment = {
      petId,
      ...form,
      dob: selectedAnimal ? selectedAnimal.dob : form.dob,
      savedAt: new Date().toISOString(),
    };
    saveAssessment(data);
    const isUpdate = !!getLatestAssessment(petId);
    logAudit("assessment-saved", `Behavioral assessment for ${data.dogName || "an animal"} was ${isUpdate ? "updated" : "recorded"} (disposition: ${data.disposition || "not set"}).`);

    setSaved(true);
    showToast(`Assessment for ${data.dogName || "animal"} saved and published.`);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 1500);
  }

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="assessment" noPrint />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast no-print${show ? " show" : ""}`}>{message}</div>

            <span className="eyebrow no-print">Staff Use Only</span>

            <form className="assessment-doc" onSubmit={handleSubmit}>
              <div className="doc-header">
                <img src="/img/logo.png" alt="Aamal Almoayyed Sanctuary for Animals" className="doc-logo" />
                <h1>Aamal Almoayyed Sanctuary</h1>
                <p className="doc-tagline">Bahrain&apos;s Biggest Sanctuary — Giving Animals a Loving Home</p>
                <h2 className="doc-title">Official Canine Behavioral &amp; Temperament Assessment (CBTA)</h2>
              </div>

              <div className="field no-print" style={{ maxWidth: 420, margin: "0 auto 28px" }}>
                <label htmlFor="assessAnimal">Select Animal *</label>
                <select id="assessAnimal" required value={petId} onChange={(e) => loadAnimal(e.target.value)}>
                  <option value="">Select an animal…</option>
                  {animals.map((p) => (
                    <option value={p.id} key={p.id}>{p.name} — {p.breed}</option>
                  ))}
                </select>
                <p className="hint">Results will be published to this animal&apos;s public profile.</p>
              </div>

              <div className="stepper assess-stepper no-print" ref={stepperRef}>
                {STEPS.map((s, i) => (
                  <div key={s.n} style={{ display: "contents" }}>
                    <div className={`step${step === s.n ? " active" : ""}${step > s.n ? " done" : ""}`} data-step={s.n}>
                      <span className="step-num">{s.icon}</span><span className="step-label">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className={`step-line${step > s.n ? " done" : ""}`} />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="assess-step active" data-step="1">
                  <h3 className="section-title"><span className="sec-icon">🐕</span> I. Specimen &amp; Intake Data</h3>
                  <div className="row-2">
                    <div className={fieldClass("field", "dogName")}><label htmlFor="dogName">Dog Name / ID</label><input type="text" id="dogName" value={form.dogName} onChange={(e) => set("dogName", e.target.value)} /></div>
                    <div className={fieldClass("field", "evalDate")}><label htmlFor="evalDate">Date of Evaluation</label><input type="date" id="evalDate" value={form.evalDate} onChange={(e) => set("evalDate", e.target.value)} /></div>
                  </div>
                  <div className={fieldClass("field", "breedMix")}><label htmlFor="breedMix">Phenotype / Breed Mix</label><input type="text" id="breedMix" value={form.breedMix} onChange={(e) => set("breedMix", e.target.value)} /></div>
                  <div className="row-2">
                    <div className={fieldClass("field", "sex")}>
                      <label>Sex</label>
                      <div className="choice-group">
                        <label><input type="radio" name="sex" checked={form.sex === "M"} onChange={() => set("sex", "M")} /> M</label>
                        <label><input type="radio" name="sex" checked={form.sex === "F"} onChange={() => set("sex", "F")} /> F</label>
                      </div>
                    </div>
                    <div className={fieldClass("field", "altered")}>
                      <label>Altered (Neutered/Spayed)</label>
                      <div className="choice-group">
                        <label><input type="radio" name="altered" checked={form.altered === "Y"} onChange={() => set("altered", "Y")} /> Y</label>
                        <label><input type="radio" name="altered" checked={form.altered === "N"} onChange={() => set("altered", "N")} /> N</label>
                      </div>
                    </div>
                  </div>
                  <div className="row-2">
                    <div className={fieldClass("field", "weightCondition")}><label htmlFor="weightCondition">Weight / Condition</label><input type="text" id="weightCondition" value={form.weightCondition} onChange={(e) => set("weightCondition", e.target.value)} /></div>
                    <div className="field">
                      <label htmlFor="dob">Date of Birth</label>
                      <input type="text" id="dob" value={selectedAnimal?.dob ? `${formatDate(selectedAnimal.dob)} (${ageLabel(selectedAnimal.dob)} old)` : ""} disabled />
                      <p className="hint">Pulled from the animal&apos;s profile — age is calculated automatically. To correct it, edit the animal&apos;s date of birth from the Animals page.</p>
                    </div>
                  </div>
                  <div className="row-2">
                    <div className={fieldClass("field", "vaccinated")}>
                      <label>Vaccinated</label>
                      <div className="choice-group">
                        <label><input type="radio" name="vaccinated" checked={form.vaccinated === "Y"} onChange={() => set("vaccinated", "Y")} /> Y</label>
                        <label><input type="radio" name="vaccinated" checked={form.vaccinated === "N"} onChange={() => set("vaccinated", "N")} /> N</label>
                      </div>
                    </div>
                    <div className={fieldClass("field", "goodWithKids")}>
                      <label>Good with Kids</label>
                      <div className="choice-group">
                        <label><input type="radio" name="goodWithKids" checked={form.goodWithKids === "Y"} onChange={() => set("goodWithKids", "Y")} /> Y</label>
                        <label><input type="radio" name="goodWithKids" checked={form.goodWithKids === "N"} onChange={() => set("goodWithKids", "N")} /> N</label>
                      </div>
                    </div>
                  </div>
                  <div className="row-2">
                    <div className={fieldClass("field", "specialist")}><label htmlFor="specialist">Placement &amp; Integration Specialist</label><input type="text" id="specialist" value={form.specialist} onChange={(e) => set("specialist", e.target.value)} /></div>
                    <div className={fieldClass("field", "location")}><label htmlFor="location">Location</label><input type="text" id="location" value={form.location} onChange={(e) => set("location", e.target.value)} /></div>
                  </div>
                  <div className="step-actions no-print">
                    <span></span>
                    <button type="button" className="btn btn-primary" onClick={() => goToStep(2)}>Next: Psychological Profiling →</button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="assess-step active" data-step="2">
                  <h3 className="section-title"><span className="sec-icon">🧠</span> II. Psychological Profiling (Temperament)</h3>
                  <p className="hint">Tap a circle to rate — from Low (1) to High (5) expression.</p>
                  <table className="profile-table">
                    <thead>
                      <tr><th>Behavioral Metric</th><th>Score</th><th>Clinical Behavioral Markers</th></tr>
                    </thead>
                    <tbody>
                      {PROFILE_METRIC_MARKERS.map(({ key, label, marker }) => (
                        <tr key={key} className={errors.has(`profileScores.${key}`) ? "field-error" : ""}>
                          <td>{label}</td>
                          <td>
                            <ScoreScale
                              value={form.profileScores[key] || ""}
                              onChange={(v) => {
                                setForm((f) => ({ ...f, profileScores: { ...f.profileScores, [key]: v } }));
                                setErrors((prev) => {
                                  const errKey = `profileScores.${key}`;
                                  if (!prev.has(errKey)) return prev;
                                  const next = new Set(prev);
                                  next.delete(errKey);
                                  return next;
                                });
                              }}
                            />
                          </td>
                          <td className="marker-cell">{marker}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="step-actions no-print">
                    <button type="button" className="btn btn-ghost" onClick={() => goToStep(1)}>← Back</button>
                    <button type="button" className="btn btn-primary" onClick={() => goToStep(3)}>Next: Drive Analysis →</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="assess-step active" data-step="3">
                  <h3 className="section-title"><span className="sec-icon"><img src="/icons/drives.png" alt="" /></span> III. Drive System Analysis (Motivation)</h3>

                  <h4 className="sub-title">1. Prey / Toy Drive (Biological Pursuit)</h4>
                  <div className={fieldClass("option-list", "preyDrive")}>
                    <label className="option-card"><input type="radio" name="preyDrive" checked={form.preyDrive === "Inert"} onChange={() => set("preyDrive", "Inert")} /><span><strong>Inert:</strong> No visual tracking; disinterested in movement.</span></label>
                    <label className="option-card"><input type="radio" name="preyDrive" checked={form.preyDrive === "Investigative"} onChange={() => set("preyDrive", "Investigative")} /><span><strong>Investigative:</strong> Tracks movement; sniffs; no pursuit.</span></label>
                    <label className="option-card"><input type="radio" name="preyDrive" checked={form.preyDrive === "Active"} onChange={() => set("preyDrive", "Active")} /><span><strong>Active:</strong> Commits to pursuit; exhibits &quot;shake&quot; or &quot;kill&quot; bite-down.</span></label>
                    <label className="option-card"><input type="radio" name="preyDrive" checked={form.preyDrive === "Hyper-Fixated"} onChange={() => set("preyDrive", "Hyper-Fixated")} /><span><strong>Hyper-Fixated:</strong> Inability to disengage; high risk for small animals.</span></label>
                  </div>

                  <h4 className="sub-title">2. Food Drive (Resource Motivation)</h4>
                  <div className={fieldClass("option-list", "foodDrive")}>
                    <label className="option-card"><input type="radio" name="foodDrive" checked={form.foodDrive === "Functional"} onChange={() => set("foodDrive", "Functional")} /><span><strong>Functional:</strong> Motivated by treats; takes food gently.</span></label>
                    <label className="option-card"><input type="radio" name="foodDrive" checked={form.foodDrive === "Competitive"} onChange={() => set("foodDrive", "Competitive")} /><span><strong>Competitive:</strong> Aggressive snatching; potential for guarding.</span></label>
                    <label className="option-card"><input type="radio" name="foodDrive" checked={form.foodDrive === "Anorectic"} onChange={() => set("foodDrive", "Anorectic")} /><span><strong>Anorectic:</strong> Refuses high-value food due to shutdown/fear.</span></label>
                  </div>

                  <h4 className="sub-title">3. Social Drive (Handler Attachment)</h4>
                  <div className={fieldClass("option-list", "socialDrive")}>
                    <label className="option-card"><input type="radio" name="socialDrive" checked={form.socialDrive === "Independent"} onChange={() => set("socialDrive", "Independent")} /><span><strong>Independent:</strong> Prioritizes environment over human; aloof.</span></label>
                    <label className="option-card"><input type="radio" name="socialDrive" checked={form.socialDrive === "Cooperative"} onChange={() => set("socialDrive", "Cooperative")} /><span><strong>Cooperative:</strong> Checks in with handler; responds to praise.</span></label>
                    <label className="option-card"><input type="radio" name="socialDrive" checked={form.socialDrive === "Anxious/Velcro"} onChange={() => set("socialDrive", "Anxious/Velcro")} /><span><strong>Anxious/Velcro:</strong> Hyper-attachment; distress upon handler exit.</span></label>
                  </div>
                  <div className="step-actions no-print">
                    <button type="button" className="btn btn-ghost" onClick={() => goToStep(2)}>← Back</button>
                    <button type="button" className="btn btn-primary" onClick={() => goToStep(4)}>Next: Dog-to-Dog Dynamics →</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="assess-step active" data-step="4">
                  <h3 className="section-title"><span className="sec-icon"><img src="/icons/paw.png" alt="" /></span> IV. Intraspecific Dynamics (Dog-to-Dog)</h3>

                  <h4 className="sub-title">A. Social Orientation</h4>
                  <div className={fieldClass("option-list", "socialOrientation")}>
                    <label className="option-card"><input type="radio" name="socialOrientation" checked={form.socialOrientation === "Pro-Social"} onChange={() => set("socialOrientation", "Pro-Social")} /><span><strong>Pro-Social:</strong> Actively seeks play; uses healthy cut-off signals.</span></label>
                    <label className="option-card"><input type="radio" name="socialOrientation" checked={form.socialOrientation === "Neutral/Tolerant"} onChange={() => set("socialOrientation", "Neutral/Tolerant")} /><span><strong>Neutral/Tolerant:</strong> Ignores others; coexists without engagement.</span></label>
                    <label className="option-card"><input type="radio" name="socialOrientation" checked={form.socialOrientation === "Selective"} onChange={() => set("socialOrientation", "Selective")} /><span><strong>Selective:</strong> Tolerates specific types (e.g., opposite sex only).</span></label>
                    <label className="option-card"><input type="radio" name="socialOrientation" checked={form.socialOrientation === "Reactive/Fear Aggressive"} onChange={() => set("socialOrientation", "Reactive/Fear Aggressive")} /><span><strong>Reactive/Fear Aggressive:</strong> Lunges/barks to create distance due to insecurity.</span></label>
                  </div>

                  <h4 className="sub-title">B. Dominance &amp; Status-Based Markers</h4>
                  <div className="field">
                    <label>Posturing</label>
                    <div className="chip-list">
                      {["T-Positioning", "Chin-over-shoulder", "Height seeking"].map((v) => (
                        <label className="chip" key={v}><input type="checkbox" checked={form.posturing.includes(v)} onChange={() => set("posturing", toggleArr(form.posturing, v))} /> {v}</label>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>Space Claiming</label>
                    <div className="chip-list">
                      {["Physical Blocking doorways", "Guarding the handler"].map((v) => (
                        <label className="chip" key={v}><input type="checkbox" checked={form.spaceClaiming.includes(v)} onChange={() => set("spaceClaiming", toggleArr(form.spaceClaiming, v))} /> {v}</label>
                      ))}
                    </div>
                  </div>
                  <div className={fieldClass("field", "socialYield")}>
                    <label>Social Yield — Does dog yield space when pressured?</label>
                    <div className="choice-group">
                      <label><input type="radio" name="socialYield" checked={form.socialYield === "Yes"} onChange={() => set("socialYield", "Yes")} /> Yes</label>
                      <label><input type="radio" name="socialYield" checked={form.socialYield === "No"} onChange={() => set("socialYield", "No")} /> No</label>
                    </div>
                  </div>
                  <div className="step-actions no-print">
                    <button type="button" className="btn btn-ghost" onClick={() => goToStep(3)}>← Back</button>
                    <button type="button" className="btn btn-primary" onClick={() => goToStep(5)}>Next: Safety &amp; Bite Log →</button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="assess-step active" data-step="5">
                  <h3 className="section-title"><span className="sec-icon">⚠️</span> V. Safety Indicators &amp; Bite Log</h3>
                  <div className="field">
                    <label>Observed Red Flags</label>
                    <div className="chip-list">
                      {["Resource Guarding", "Barrier Frustration", "Redirected Aggression", "Status Driven"].map((v) => (
                        <label className="chip chip-danger" key={v}><input type="checkbox" checked={form.redFlags.includes(v)} onChange={() => set("redFlags", toggleArr(form.redFlags, v))} /> {v}</label>
                      ))}
                    </div>
                  </div>
                  <div className={fieldClass("field", "incidentHistory")}>
                    <label htmlFor="incidentHistory">Incident History</label>
                    <textarea id="incidentHistory" rows={6} placeholder="Describe any incidents, dates, and context…" value={form.incidentHistory} onChange={(e) => set("incidentHistory", e.target.value)} />
                  </div>
                  <div className="step-actions no-print">
                    <button type="button" className="btn btn-ghost" onClick={() => goToStep(4)}>← Back</button>
                    <button type="button" className="btn btn-primary" onClick={() => goToStep(6)}>Next: Final Disposition →</button>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="assess-step active" data-step="6">
                  <h3 className="section-title"><span className="sec-icon">🏁</span> VI. Final Disposition</h3>
                  <div className={fieldClass("disposition-list", "disposition")}>
                    <label className="disposition-option level-green">
                      <input type="radio" name="disposition" checked={form.disposition === "Level 1 (Green)"} onChange={() => set("disposition", "Level 1 (Green)")} />
                      <span><strong>Level 1 (Green): Public-Ready.</strong> High sociability; no guarding.</span>
                    </label>
                    <label className="disposition-option level-blue">
                      <input type="radio" name="disposition" checked={form.disposition === "Level 2 (Blue)"} onChange={() => set("disposition", "Level 2 (Blue)")} />
                      <span><strong>Level 2 (Blue): Managed.</strong> Minor reactivity; requires training.</span>
                    </label>
                    <label className="disposition-option level-yellow">
                      <input type="radio" name="disposition" checked={form.disposition === "Level 3 (Yellow)"} onChange={() => set("disposition", "Level 3 (Yellow)")} />
                      <span><strong>Level 3 (Yellow): Specialized.</strong> High drive; experienced handler only.</span>
                    </label>
                    <label className="disposition-option level-orange">
                      <input type="radio" name="disposition" checked={form.disposition === "Level 4 (Orange)"} onChange={() => set("disposition", "Level 4 (Orange)")} />
                      <span><strong>Level 4 (Orange): Sanctuary Rehabilitation.</strong></span>
                    </label>
                    <div className="disposition-subtypes">
                      <label><input type="checkbox" checked={form.orangeSubtype.includes("Behavioral")} onChange={() => set("orangeSubtype", toggleArr(form.orangeSubtype, "Behavioral"))} /> Subtype A: Behavioral (Chronic aggression/guarding)</label>
                      <label><input type="checkbox" checked={form.orangeSubtype.includes("Clinical Fear")} onChange={() => set("orangeSubtype", toggleArr(form.orangeSubtype, "Clinical Fear"))} /> Subtype B: Clinical Fear (Total shutdown/catatonic)</label>
                    </div>
                    <label className="disposition-option level-red">
                      <input type="radio" name="disposition" checked={form.disposition === "Level 5 (Red)"} onChange={() => set("disposition", "Level 5 (Red)")} />
                      <span><strong>Level 5 (Red): Strict Safety Protocol.</strong> Extreme risk; dual-handler / no contact.</span>
                    </label>
                  </div>

                  <h3 className="section-title">Sign-Off</h3>
                  <div className={fieldClass("field", "signSpecialist")}><label htmlFor="signSpecialist">Placement &amp; Integration Specialist</label><input type="text" id="signSpecialist" value={form.signSpecialist} onChange={(e) => set("signSpecialist", e.target.value)} /></div>
                  <div className="row-2">
                    <div className={fieldClass("field", "signature")}><label htmlFor="signature">Signature</label><input type="text" id="signature" placeholder="Type full name to sign" value={form.signature} onChange={(e) => set("signature", e.target.value)} /></div>
                    <div className={fieldClass("field", "signDate")}><label htmlFor="signDate">Date</label><input type="date" id="signDate" value={form.signDate} onChange={(e) => set("signDate", e.target.value)} /></div>
                  </div>

                  <div className="step-actions no-print">
                    <button type="button" className="btn btn-ghost" onClick={() => goToStep(5)}>← Back</button>
                    <span></span>
                  </div>

                  <div className="doc-actions no-print">
                    <button type="button" className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print / Export PDF</button>
                    <button type="submit" className="btn btn-primary">Save &amp; Publish to Animal Profile</button>
                  </div>

                  {saved && <p className="save-confirm no-print"><img src="/icons/check-clock.png" alt="" className="icon-img-sm" /> Assessment saved and published to the animal&apos;s profile.</p>}
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

const PROFILE_METRIC_MARKERS = [
  { key: "humanSociability" as const, label: "Human Sociability", marker: "Tolerance for proximity; active solicitation of physical contact." },
  { key: "arousalThreshold" as const, label: "Arousal Threshold", marker: "Speed of reaching high-excitement state." },
  { key: "recoveryLatency" as const, label: "Recovery Latency", marker: "Time to return to baseline after stress." },
  { key: "environmentalConfidence" as const, label: "Environmental Confidence", marker: "Reaction to novel surfaces, loud sounds and visual stimuli." },
  { key: "frustrationTolerance" as const, label: "Frustration Tolerance", marker: "Response when a desired goal is withheld." },
  { key: "tactileSensitivity" as const, label: "Tactile Sensitivity", marker: "Reaction to sudden or intrusive physical manipulation." },
];

export default function AdminAssessmentPage() {
  return (
    <Suspense fallback={null}>
      <AssessmentPageInner />
    </Suspense>
  );
}
