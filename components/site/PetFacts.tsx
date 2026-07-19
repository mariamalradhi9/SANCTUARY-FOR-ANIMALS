"use client";

import { useEffect, useState } from "react";
import type { Animal, Assessment } from "@/lib/types";
import { getLatestAssessment } from "@/lib/records";
import { yesNoLabel } from "@/lib/petProfile";

export default function PetFacts({ pet }: { pet: Animal }) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    setAssessment(getLatestAssessment(pet.id));
  }, [pet.id]);

  const ageLabel = pet.age < 1 ? `${Math.round(pet.age * 12)} months` : `${pet.age} years`;
  const sizeLabel = pet.size.charAt(0).toUpperCase() + pet.size.slice(1);
  const genderLabel = assessment?.sex ? (assessment.sex === "M" ? "Male" : "Female") : pet.gender === "male" ? "Male" : "Female";
  const vaccinatedLabel = yesNoLabel(assessment?.vaccinated, "Yes");
  const neuteredLabel = yesNoLabel(assessment?.altered, "Yes");
  const goodWithKidsLabel = yesNoLabel(assessment?.goodWithKids, "Yes");
  const weightLabel = assessment?.weightCondition || "—";

  return (
    <div className="fact-grid">
      <div className="fact"><span className="fact-icon"><img src="/icons/age.png" alt="" /></span><div><strong>Age</strong><br />{ageLabel}</div></div>
      <div className="fact"><span className="fact-icon"><img src="/icons/size.png" alt="" /></span><div><strong>Size</strong><br />{sizeLabel}</div></div>
      <div className="fact"><span className="fact-icon"><img src="/icons/gender.png" alt="" /></span><div><strong>Gender</strong><br />{genderLabel}</div></div>
      <div className="fact"><span className="fact-icon"><img src="/icons/vaccinated.png" alt="" /></span><div><strong>Vaccinated</strong><br />{vaccinatedLabel}</div></div>
      <div className="fact"><span className="fact-icon"><img src="/icons/neutered.png" alt="" /></span><div><strong>Neutered</strong><br />{neuteredLabel}</div></div>
      <div className="fact"><span className="fact-icon"><img src="/icons/kids.png" alt="" /></span><div><strong>Good with kids</strong><br />{goodWithKidsLabel}</div></div>
      <div className="fact"><span className="fact-icon"><img src="/icons/weight.png" alt="" /></span><div><strong>Weight</strong><br />{weightLabel}</div></div>
    </div>
  );
}
