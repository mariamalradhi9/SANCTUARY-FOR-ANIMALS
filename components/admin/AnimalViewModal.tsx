"use client";

import Modal from "../Modal";
import PetFacts from "../site/PetFacts";
import BehavioralProfile from "../site/BehavioralProfile";
import type { Animal } from "@/lib/types";

export default function AnimalViewModal({ animal, onClose }: { animal: Animal | null; onClose: () => void }) {
  if (!animal) return null;

  return (
    <Modal title={animal.name} onClose={onClose}>
      <img
        src={animal.img}
        alt={animal.name}
        style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 12, marginBottom: 16 }}
      />
      {animal.tag && <span className="badge badge-info" style={{ marginBottom: 10, display: "inline-block" }}>{animal.tag}</span>}
      <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
        {animal.species.charAt(0).toUpperCase() + animal.species.slice(1)} · {animal.breed}
      </p>

      <PetFacts pet={animal} />

      {animal.desc && (
        <>
          <h4 className="sub-title">About {animal.name}</h4>
          <p>{animal.desc}</p>
        </>
      )}

      <BehavioralProfile petId={animal.id} petName={animal.name} />
    </Modal>
  );
}
