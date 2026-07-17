"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import SmartBackLink from "@/components/site/SmartBackLink";
import PetFacts from "@/components/site/PetFacts";
import BehavioralProfile from "@/components/site/BehavioralProfile";
import { getAnimals } from "@/lib/animals";
import { getApplications, saveApplications } from "@/lib/records";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Application } from "@/lib/types";

const TOTAL_STEPS = 3;

interface FormState {
  applicantPhoto: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  maritalStatus: string;
  housingType: string;
  address: string;
  petChoice: string;
  ownedBefore: string;
  householdSize: string;
  otherPets: string;
  whyAdopt: string;
  agreeTerms: boolean;
}

function AdoptInner() {
  usePageTitle("Adoption Application — Aamal Almoayyed Sanctuary");
  const router = useRouter();
  const params = useSearchParams();
  const animals = getAnimals();
  const preselect = params.get("pet");
  const initialPetId = preselect && animals.some((p) => p.id === preselect) ? preselect : animals[0]?.id || "";

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    applicantPhoto: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    maritalStatus: "single",
    housingType: "apartment",
    address: "",
    petChoice: initialPetId,
    ownedBefore: "",
    householdSize: "1",
    otherPets: "",
    whyAdopt: "",
    agreeTerms: false,
  });

  const pet = animals.find((p) => p.id === form.petChoice) || animals[0];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("applicantPhoto", reader.result as string);
    reader.readAsDataURL(file);
  }

  function validateStep1(): boolean {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim() || !form.gender) {
      alert("Please complete all required fields before continuing.");
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    if (!form.petChoice || !form.ownedBefore) {
      alert("Please complete all required fields before continuing.");
      return false;
    }
    return true;
  }

  function goToStep(next: number) {
    if (next < 1 || next > TOTAL_STEPS) return;
    setStep(next);
    requestAnimationFrame(() => {
      const stepper = document.querySelector(".stepper");
      if (stepper) window.scrollTo({ top: (stepper as HTMLElement).offsetTop - 100, behavior: "smooth" });
    });
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    goToStep(step + 1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    if (!form.agreeTerms) {
      alert("Please confirm the agreement checkbox to submit.");
      return;
    }

    const applications = getApplications();
    const newApp: Application = {
      id: "app-" + Date.now(),
      petId: pet ? pet.id : "",
      petName: pet ? pet.name : "Unknown",
      applicant: `${form.firstName} ${form.lastName}`,
      photo: form.applicantPhoto,
      email: form.email,
      phone: form.phone,
      gender: form.gender,
      maritalStatus: form.maritalStatus,
      housingType: form.housingType,
      address: form.address,
      ownedBefore: form.ownedBefore,
      householdSize: Number(form.householdSize),
      otherPets: form.otherPets,
      whyAdopt: form.whyAdopt,
      date: new Date().toISOString().slice(0, 10),
      status: "Pending Review",
      history: [{ status: "Pending Review", date: new Date().toISOString().slice(0, 10) }],
    };
    saveApplications([...applications, newApp]);
    setSubmitted(true);
  }

  return (
    <AuthGuard>
      <SiteHeader active="adopt" />

      <section className="adopt-form-section">
        <div className="container">
          <SmartBackLink href="/search">← Back</SmartBackLink>
          <div className="section-head">
            <span className="eyebrow">Adoption Request</span>
            <h1>Let&apos;s Find a Match</h1>
            <p>Tell us about yourself and your home so we can match you with the right companion.</p>
          </div>

          {!submitted && (
            <div className="stepper">
              <div className={`step${step === 1 ? " active" : ""}${step > 1 ? " done" : ""}`} data-step="1"><span className="step-num">👤</span><span className="step-label">Personal Info</span></div>
              <div className={`step-line${step > 1 ? " done" : ""}`}></div>
              <div className={`step${step === 2 ? " active" : ""}${step > 2 ? " done" : ""}`} data-step="2"><span className="step-num">🐾</span><span className="step-label">Choose Pet</span></div>
              <div className={`step-line${step > 2 ? " done" : ""}`}></div>
              <div className={`step${step === 3 ? " active" : ""}`} data-step="3"><span className="step-num">✅</span><span className="step-label">Confirm</span></div>
            </div>
          )}

          {!submitted && (
            <div className="adopt-layout">
              <form className="form-card" onSubmit={handleSubmit}>
                <div className={`form-step${step === 1 ? " active" : ""}`}>
                  <div className="field">
                    <label>Your Photo</label>
                    <div className="profile-photo-field">
                      <div className="profile-photo-preview">
                        {form.applicantPhoto ? <img src={form.applicantPhoto} alt="Your photo" /> : "👤"}
                      </div>
                      <div>
                        <label htmlFor="applicantPhotoInput" className="btn btn-outline btn-sm">Upload Photo</label>
                        <input type="file" id="applicantPhotoInput" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                        <p className="hint">Optional — helps our team recognize you.</p>
                      </div>
                    </div>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label htmlFor="firstName">First Name *</label>
                      <input type="text" id="firstName" required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="lastName">Last Name *</label>
                      <input type="text" id="lastName" required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                    </div>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label htmlFor="email">Email *</label>
                      <input type="email" id="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="phone">Phone Number *</label>
                      <input type="tel" id="phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Gender *</label>
                    <div className="choice-group">
                      <label><input type="radio" name="gender" value="male" required checked={form.gender === "male"} onChange={(e) => update("gender", e.target.value)} /> Male</label>
                      <label><input type="radio" name="gender" value="female" checked={form.gender === "female"} onChange={(e) => update("gender", e.target.value)} /> Female</label>
                    </div>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label htmlFor="maritalStatus">Marital Status</label>
                      <select id="maritalStatus" value={form.maritalStatus} onChange={(e) => update("maritalStatus", e.target.value)}>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="housingType">Housing Type</label>
                      <select id="housingType" value={form.housingType} onChange={(e) => update("housingType", e.target.value)}>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa with yard</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="address">Home Address *</label>
                    <textarea id="address" required value={form.address} onChange={(e) => update("address", e.target.value)} />
                  </div>
                  <div className="step-actions">
                    <span></span>
                    <button type="button" className="btn btn-primary next-step" onClick={handleNext}>Next: Choose Pet →</button>
                  </div>
                </div>

                <div className={`form-step${step === 2 ? " active" : ""}`}>
                  <div className="field">
                    <label htmlFor="petChoice">Which pet are you applying for? *</label>
                    <select id="petChoice" required value={form.petChoice} onChange={(e) => update("petChoice", e.target.value)}>
                      {animals.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.breed}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Have you owned a pet before? *</label>
                    <div className="choice-group">
                      <label><input type="radio" name="ownedBefore" value="yes" required checked={form.ownedBefore === "yes"} onChange={(e) => update("ownedBefore", e.target.value)} /> Yes</label>
                      <label><input type="radio" name="ownedBefore" value="no" checked={form.ownedBefore === "no"} onChange={(e) => update("ownedBefore", e.target.value)} /> No</label>
                    </div>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label htmlFor="householdSize">Household Members</label>
                      <input type="number" id="householdSize" min="1" value={form.householdSize} onChange={(e) => update("householdSize", e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="otherPets">Other Pets at Home</label>
                      <input type="text" id="otherPets" placeholder="e.g. 1 cat, none" value={form.otherPets} onChange={(e) => update("otherPets", e.target.value)} />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="whyAdopt">Why do you want to adopt this pet?</label>
                    <textarea id="whyAdopt" placeholder="Tell us a little about why this pet is a good fit for your home…" value={form.whyAdopt} onChange={(e) => update("whyAdopt", e.target.value)} />
                  </div>
                  <div className="step-actions">
                    <button type="button" className="btn btn-ghost prev-step" onClick={() => goToStep(step - 1)}>← Back</button>
                    <button type="button" className="btn btn-primary next-step" onClick={handleNext}>Next: Confirm →</button>
                  </div>
                </div>

                <div className={`form-step${step === 3 ? " active" : ""}`}>
                  <h3>Review Your Application</h3>
                  <div className="summary-box">
                    {[
                      ["Name", `${form.firstName} ${form.lastName}`],
                      ["Email", form.email],
                      ["Phone", form.phone],
                      ["Gender", form.gender || "—"],
                      ["Marital Status", form.maritalStatus],
                      ["Housing Type", form.housingType],
                      ["Applying For", pet ? `${pet.name} (${pet.breed})` : "—"],
                      ["Owned a Pet Before", form.ownedBefore || "—"],
                      ["Household Members", form.householdSize],
                    ].map(([label, value]) => (
                      <div className="summary-row" key={label}><span>{label}</span><strong>{value || "—"}</strong></div>
                    ))}
                  </div>
                  <div className="field" style={{ marginTop: 20 }}>
                    <label className="checkbox-inline">
                      <input type="checkbox" required checked={form.agreeTerms} onChange={(e) => update("agreeTerms", e.target.checked)} />
                      I confirm this information is accurate and agree to a home-check visit before adoption is finalized.
                    </label>
                  </div>
                  <div className="step-actions">
                    <button type="button" className="btn btn-ghost prev-step" onClick={() => goToStep(step - 1)}>← Back</button>
                    <button type="submit" className="btn btn-primary">Submit Application</button>
                  </div>
                </div>
              </form>

              <aside className="adopt-side">
                <div className="side-card pet-preview-card">
                  <h4>Applying For</h4>
                  {pet && (
                    <div className="side-pet-details">
                      <img src={pet.img} alt={pet.name} />
                      <h3>{pet.name}</h3>
                      <p>{pet.breed} · {pet.age < 1 ? `${Math.round(pet.age * 12)} mo` : `${pet.age} yrs`}</p>
                      <PetFacts pet={pet} />
                      <BehavioralProfile petId={pet.id} petName={pet.name} />
                    </div>
                  )}
                </div>
                <div className="side-card tips-card">
                  <h4>What Happens Next?</h4>
                  <ul>
                    <li><span className="tip-icon">📩</span> We review your application within 2–3 business days.</li>
                    <li><span className="tip-icon">🏡</span> A placement specialist schedules a home visit.</li>
                    <li><span className="tip-icon">🐾</span> You welcome your new companion home!</li>
                  </ul>
                </div>
              </aside>
            </div>
          )}

          {submitted && (
            <div className="form-card success-box">
              <div className="success-icon">🎉</div>
              <h2>Application Submitted!</h2>
              <p>Thank you for opening your home to an animal in need. Our placement team will review your application and reach out within 2–3 business days.</p>
              <button type="button" className="btn btn-primary" onClick={() => router.push("/dashboard")}>View My Applications</button>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </AuthGuard>
  );
}

export default function AdoptPage() {
  return (
    <Suspense fallback={null}>
      <AdoptInner />
    </Suspense>
  );
}
