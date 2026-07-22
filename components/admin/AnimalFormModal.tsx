"use client";

import { useEffect, useState } from "react";
import Modal from "../Modal";
import type { Animal, Gender, Size, Species, YesNo } from "@/lib/types";

interface FormState {
  name: string;
  species: Species;
  breed: string;
  dob: string;
  size: Size;
  gender: Gender;
  img: string;
  desc: string;
  available: boolean;

  onboardingDate: string;
  govtSupport: YesNo;
  govtSupportValue: string;

  aggressionLevel: "" | "Low" | "Medium" | "High" | "Severe";
  aggressionDetails: string;
  behaviorDetails: string;
  medicalStatus: "Healthy" | "Under Treatment" | "Chronic Condition" | "Critical";
  vaccinationStatus: "Up to Date" | "Due" | "Not Vaccinated";
  nutritionStatus: "Good" | "Needs Improvement" | "Poor";
  nextVetCheckDue: string;
  chipped: YesNo;

  kennelNumber: string;
  kennelInCharge: string;

  trained: YesNo;
  trainerName: string;
  trainingHours: string;
  trainingLevel: "Basic" | "Intermediate" | "Advanced";

  readyForAdoption: YesNo;
  adoptionDate: string;
  adoptionType: "" | "Local" | "Abroad";
  destinationCountry: string;

  adopterName: string;
  adopterMobile: string;
  adopterEmail: string;
  adopterAddress: string;
  adopterPaidFree: "" | "Paid" | "Free";
  adopterAmountPaid: string;

  remarks: string;
}

const EMPTY_FORM: FormState = {
  name: "", species: "dog", breed: "", dob: "", size: "small", gender: "male", img: "", desc: "", available: true,
  onboardingDate: "", govtSupport: "No", govtSupportValue: "",
  aggressionLevel: "", aggressionDetails: "", behaviorDetails: "", medicalStatus: "Healthy", vaccinationStatus: "Up to Date", nutritionStatus: "Good", nextVetCheckDue: "", chipped: "No",
  kennelNumber: "", kennelInCharge: "",
  trained: "No", trainerName: "", trainingHours: "", trainingLevel: "Basic",
  readyForAdoption: "No", adoptionDate: "", adoptionType: "", destinationCountry: "",
  adopterName: "", adopterMobile: "", adopterEmail: "", adopterAddress: "", adopterPaidFree: "", adopterAmountPaid: "",
  remarks: "",
};

function fromAnimal(a: Animal): FormState {
  const adopter = a.adopter || { name: "", mobile: "", email: "", address: "", paidOrFree: "" as const, amountPaid: null };
  return {
    name: a.name, species: a.species, breed: a.breed, dob: a.dob || "", size: a.size, gender: a.gender, img: a.img || "", desc: a.desc || "", available: a.available !== false,
    onboardingDate: a.onboardingDate || "", govtSupport: a.govtSupport || "No", govtSupportValue: a.govtSupportValue != null ? String(a.govtSupportValue) : "",
    aggressionLevel: a.aggressionLevel || "", aggressionDetails: a.aggressionDetails || "", behaviorDetails: a.behaviorDetails || "",
    medicalStatus: a.medicalStatus || "Healthy", vaccinationStatus: a.vaccinationStatus || "Up to Date", nutritionStatus: a.nutritionStatus || "Good",
    nextVetCheckDue: a.nextVetCheckDue || "", chipped: a.chipped || "No",
    kennelNumber: a.kennelNumber || "", kennelInCharge: a.kennelInCharge || "",
    trained: a.trained || "No", trainerName: a.trainerName || "", trainingHours: a.trainingHours != null ? String(a.trainingHours) : "", trainingLevel: a.trainingLevel || "Basic",
    readyForAdoption: a.readyForAdoption || "No", adoptionDate: a.adoptionDate || "", adoptionType: a.adoptionType || "", destinationCountry: a.destinationCountry || "",
    adopterName: adopter.name || "", adopterMobile: adopter.mobile || "", adopterEmail: adopter.email || "", adopterAddress: adopter.address || "", adopterPaidFree: adopter.paidOrFree || "", adopterAmountPaid: adopter.amountPaid != null ? String(adopter.amountPaid) : "",
    remarks: a.remarks || "",
  };
}

export interface AnimalFormData {
  name: string; species: Species; breed: string; dob: string; size: Size; gender: Gender; img: string; desc: string; available: boolean;
  onboardingDate: string; govtSupport: YesNo; govtSupportValue: number | null;
  aggressionLevel: "" | "Low" | "Medium" | "High" | "Severe"; aggressionDetails: string; behaviorDetails: string;
  medicalStatus: "Healthy" | "Under Treatment" | "Chronic Condition" | "Critical";
  vaccinationStatus: "Up to Date" | "Due" | "Not Vaccinated";
  nutritionStatus: "Good" | "Needs Improvement" | "Poor";
  nextVetCheckDue: string; chipped: YesNo;
  kennelNumber: string; kennelInCharge: string;
  trained: YesNo; trainerName: string; trainingHours: number | null; trainingLevel: "Basic" | "Intermediate" | "Advanced";
  readyForAdoption: YesNo; adoptionDate: string; adoptionType: "" | "Local" | "Abroad"; destinationCountry: string;
  adopter: { name: string; mobile: string; email: string; address: string; paidOrFree: "" | "Paid" | "Free"; amountPaid: number | null };
  remarks: string;
}

export default function AnimalFormModal({ open, animal, onClose, onSave }: {
  open: boolean;
  animal: Animal | null;
  onClose: () => void;
  onSave: (data: AnimalFormData) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(animal ? fromAnimal(animal) : EMPTY_FORM);
  }, [open, animal]);

  if (!open) return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim(),
      dob: form.dob,
      size: form.size,
      gender: form.gender,
      img: form.img.trim(),
      desc: form.desc.trim(),
      available: form.available,
      onboardingDate: form.onboardingDate,
      govtSupport: form.govtSupport,
      govtSupportValue: form.govtSupportValue ? Number(form.govtSupportValue) : null,
      aggressionLevel: form.aggressionLevel,
      aggressionDetails: form.aggressionDetails.trim(),
      behaviorDetails: form.behaviorDetails.trim(),
      medicalStatus: form.medicalStatus,
      vaccinationStatus: form.vaccinationStatus,
      nutritionStatus: form.nutritionStatus,
      nextVetCheckDue: form.nextVetCheckDue,
      chipped: form.chipped,
      kennelNumber: form.kennelNumber.trim(),
      kennelInCharge: form.kennelInCharge.trim(),
      trained: form.trained,
      trainerName: form.trainerName.trim(),
      trainingHours: form.trainingHours ? Number(form.trainingHours) : null,
      trainingLevel: form.trainingLevel,
      readyForAdoption: form.readyForAdoption,
      adoptionDate: form.adoptionDate,
      adoptionType: form.adoptionType,
      destinationCountry: form.destinationCountry.trim(),
      adopter: {
        name: form.adopterName.trim(),
        mobile: form.adopterMobile.trim(),
        email: form.adopterEmail.trim(),
        address: form.adopterAddress.trim(),
        paidOrFree: form.adopterPaidFree,
        amountPaid: form.adopterAmountPaid ? Number(form.adopterAmountPaid) : null,
      },
      remarks: form.remarks.trim(),
    });
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("img", reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <Modal title={animal ? `Edit ${animal.name}` : "Add Animal"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="row-2">
          <div className="field">
            <label htmlFor="animalName">Name *</label>
            <input type="text" id="animalName" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="animalSpecies">Species *</label>
            <select id="animalSpecies" required value={form.species} onChange={(e) => set("species", e.target.value as Species)}>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="rabbit">Rabbit</option>
            </select>
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label htmlFor="animalBreed">Breed *</label>
            <input type="text" id="animalBreed" required value={form.breed} onChange={(e) => set("breed", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="animalDob">Date of Birth *</label>
            <input type="date" id="animalDob" required max={new Date().toISOString().slice(0, 10)} value={form.dob} onChange={(e) => set("dob", e.target.value)} />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label htmlFor="animalSize">Size</label>
            <select id="animalSize" value={form.size} onChange={(e) => set("size", e.target.value as Size)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="animalGender">Gender</label>
            <select id="animalGender" value={form.gender} onChange={(e) => set("gender", e.target.value as Gender)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Photo</label>
          <div className="profile-photo-field">
            <div className="profile-photo-preview">{form.img ? <img src={form.img} alt="Preview" /> : <img src="/icons/paw.png" alt="" />}</div>
            <div>
              <label htmlFor="animalImgInput" className="btn btn-outline btn-sm">Upload Photo</label>
              <input type="file" id="animalImgInput" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
              <p className="hint">JPG or PNG.</p>
            </div>
          </div>
        </div>
        <div className="field">
          <label htmlFor="animalDesc">Description</label>
          <textarea id="animalDesc" rows={3} value={form.desc} onChange={(e) => set("desc", e.target.value)} />
        </div>
        <div className="field">
          <label className="checkbox-inline">
            <input type="checkbox" checked={form.available} onChange={(e) => set("available", e.target.checked)} /> Available for adoption / visits
          </label>
        </div>

        <h4 className="sub-title">📋 Onboarding &amp; Government Support</h4>
        <div className="row-2">
          <div className="field">
            <label htmlFor="animalOnboardingDate">Onboarding Date</label>
            <input type="date" id="animalOnboardingDate" value={form.onboardingDate} onChange={(e) => set("onboardingDate", e.target.value)} />
          </div>
          <div className="field">
            <label>AASA Support Received from Government</label>
            <div className="choice-group">
              <label><input type="radio" name="govtSupport" checked={form.govtSupport === "Yes"} onChange={() => set("govtSupport", "Yes")} /> Yes</label>
              <label><input type="radio" name="govtSupport" checked={form.govtSupport === "No"} onChange={() => set("govtSupport", "No")} /> No</label>
            </div>
          </div>
        </div>
        {form.govtSupport === "Yes" && (
          <div className="field">
            <label htmlFor="animalGovtSupportValue">Government Support Value for Expenses (BD)</label>
            <input type="number" id="animalGovtSupportValue" step="0.001" min="0" value={form.govtSupportValue} onChange={(e) => set("govtSupportValue", e.target.value)} />
          </div>
        )}

        <h4 className="sub-title"><img src="/icons/assessment.png" alt="" className="icon-img-sm" /> Health &amp; Behavior</h4>
        <div className="row-2">
          <div className="field">
            <label htmlFor="animalAggressionLevel">Aggression Level</label>
            <select id="animalAggressionLevel" value={form.aggressionLevel} onChange={(e) => set("aggressionLevel", e.target.value as FormState["aggressionLevel"])}>
              <option value="">Not assessed</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="animalChipped">Chipped</label>
            <div className="choice-group">
              <label><input type="radio" name="chipped" checked={form.chipped === "Yes"} onChange={() => set("chipped", "Yes")} /> Yes</label>
              <label><input type="radio" name="chipped" checked={form.chipped === "No"} onChange={() => set("chipped", "No")} /> No</label>
            </div>
          </div>
        </div>
        <div className="field">
          <label htmlFor="animalAggressionDetails">Aggression Details</label>
          <textarea id="animalAggressionDetails" rows={2} placeholder="Triggers, incidents, handling notes…" value={form.aggressionDetails} onChange={(e) => set("aggressionDetails", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="animalBehaviorDetails">Behavior Details</label>
          <textarea id="animalBehaviorDetails" rows={2} placeholder="General temperament, quirks, preferences…" value={form.behaviorDetails} onChange={(e) => set("behaviorDetails", e.target.value)} />
        </div>
        <div className="row-3">
          <div className="field">
            <label htmlFor="animalMedicalStatus">Medical Status</label>
            <select id="animalMedicalStatus" value={form.medicalStatus} onChange={(e) => set("medicalStatus", e.target.value as FormState["medicalStatus"])}>
              <option value="Healthy">Healthy</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Chronic Condition">Chronic Condition</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="animalVaccinationStatus">Vaccination Status</label>
            <select id="animalVaccinationStatus" value={form.vaccinationStatus} onChange={(e) => set("vaccinationStatus", e.target.value as FormState["vaccinationStatus"])}>
              <option value="Up to Date">Up to Date</option>
              <option value="Due">Due</option>
              <option value="Not Vaccinated">Not Vaccinated</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="animalNutritionStatus">Nutrition Status</label>
            <select id="animalNutritionStatus" value={form.nutritionStatus} onChange={(e) => set("nutritionStatus", e.target.value as FormState["nutritionStatus"])}>
              <option value="Good">Good</option>
              <option value="Needs Improvement">Needs Improvement</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="animalNextVetCheck">Next Mandatory Vet / Nail Trim Check Due</label>
          <input type="date" id="animalNextVetCheck" value={form.nextVetCheckDue} onChange={(e) => set("nextVetCheckDue", e.target.value)} />
          <p className="hint">Flags this animal on the Admin Dashboard once this date has passed.</p>
        </div>

        <h4 className="sub-title"><img src="/icons/kennel.png" alt="" className="icon-img-sm" /> Kennel Assignment</h4>
        <div className="row-2">
          <div className="field">
            <label htmlFor="animalKennelNumber">Kennel / Shelter Number</label>
            <input type="text" id="animalKennelNumber" placeholder="e.g. B-12" value={form.kennelNumber} onChange={(e) => set("kennelNumber", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="animalKennelInCharge">Kennel In-Charge</label>
            <input type="text" id="animalKennelInCharge" placeholder="Staff member responsible" value={form.kennelInCharge} onChange={(e) => set("kennelInCharge", e.target.value)} />
          </div>
        </div>

        <h4 className="sub-title"><img src="/icons/training.png" alt="" className="icon-img-sm" /> Training</h4>
        <div className="field">
          <label>Received Training from AASA</label>
          <div className="choice-group">
            <label><input type="radio" name="trained" checked={form.trained === "Yes"} onChange={() => set("trained", "Yes")} /> Yes</label>
            <label><input type="radio" name="trained" checked={form.trained === "No"} onChange={() => set("trained", "No")} /> No</label>
          </div>
        </div>
        {form.trained === "Yes" && (
          <div className="row-3">
            <div className="field">
              <label htmlFor="animalTrainerName">Trainer Name</label>
              <input type="text" id="animalTrainerName" value={form.trainerName} onChange={(e) => set("trainerName", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="animalTrainingHours">Hours of Training</label>
              <input type="number" id="animalTrainingHours" min="0" value={form.trainingHours} onChange={(e) => set("trainingHours", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="animalTrainingLevel">Level of Training</label>
              <select id="animalTrainingLevel" value={form.trainingLevel} onChange={(e) => set("trainingLevel", e.target.value as FormState["trainingLevel"])}>
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        )}

        <h4 className="sub-title">🏡 Adoption Readiness &amp; Placement</h4>
        <div className="row-2">
          <div className="field">
            <label>Ready for Adoption</label>
            <div className="choice-group">
              <label><input type="radio" name="readyForAdoption" checked={form.readyForAdoption === "Yes"} onChange={() => set("readyForAdoption", "Yes")} /> Yes</label>
              <label><input type="radio" name="readyForAdoption" checked={form.readyForAdoption === "No"} onChange={() => set("readyForAdoption", "No")} /> No</label>
            </div>
          </div>
          <div className="field">
            <label htmlFor="animalAdoptionDate">Adoption Date</label>
            <input type="date" id="animalAdoptionDate" value={form.adoptionDate} onChange={(e) => set("adoptionDate", e.target.value)} />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label htmlFor="animalAdoptionType">Adoption Type</label>
            <select id="animalAdoptionType" value={form.adoptionType} onChange={(e) => set("adoptionType", e.target.value as FormState["adoptionType"])}>
              <option value="">—</option>
              <option value="Local">Local</option>
              <option value="Abroad">Abroad</option>
            </select>
          </div>
          {form.adoptionType === "Abroad" && (
            <div className="field">
              <label htmlFor="animalDestinationCountry">Destination Country</label>
              <input type="text" id="animalDestinationCountry" value={form.destinationCountry} onChange={(e) => set("destinationCountry", e.target.value)} />
            </div>
          )}
        </div>

        <h4 className="sub-title"><img src="/icons/user.png" alt="" className="icon-img-sm" /> Adopter Details</h4>
        <div className="row-2">
          <div className="field">
            <label htmlFor="animalAdopterName">Name</label>
            <input type="text" id="animalAdopterName" value={form.adopterName} onChange={(e) => set("adopterName", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="animalAdopterMobile">Mobile Number</label>
            <input type="tel" id="animalAdopterMobile" value={form.adopterMobile} onChange={(e) => set("adopterMobile", e.target.value)} />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label htmlFor="animalAdopterEmail">Email Address</label>
            <input type="email" id="animalAdopterEmail" value={form.adopterEmail} onChange={(e) => set("adopterEmail", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="animalAdopterPaidFree">Paid or Free Adoption</label>
            <select id="animalAdopterPaidFree" value={form.adopterPaidFree} onChange={(e) => set("adopterPaidFree", e.target.value as FormState["adopterPaidFree"])}>
              <option value="">—</option>
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="animalAdopterAddress">Physical Address</label>
          <textarea id="animalAdopterAddress" rows={2} value={form.adopterAddress} onChange={(e) => set("adopterAddress", e.target.value)} />
        </div>
        {form.adopterPaidFree === "Paid" && (
          <div className="field">
            <label htmlFor="animalAdopterAmountPaid">Amount Paid (BD)</label>
            <input type="number" id="animalAdopterAmountPaid" step="0.001" min="0" value={form.adopterAmountPaid} onChange={(e) => set("adopterAmountPaid", e.target.value)} />
          </div>
        )}

        <h4 className="sub-title">📝 Other Remarks</h4>
        <div className="field">
          <textarea rows={3} placeholder="Any other notes about this animal…" value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary btn-block">Save Animal</button>
      </form>
    </Modal>
  );
}
