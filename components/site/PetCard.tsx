import Link from "next/link";
import type { Animal } from "@/lib/types";
import FavButton from "./FavButton";

/** `tagOverride` exists because the original index.html hardcodes the species
 * name ("Dog"/"Cat"/"Rabbit") as the tag on its 3 featured cards, while
 * search.html shows the pet's actual `.tag` field ("New"/"Popular"/"Urgent").
 * That's an inconsistency in the original static site — preserved as-is here
 * rather than "fixed", since the brief was pixel parity, not a redesign. */
export default function PetCard({ pet, tagOverride }: { pet: Animal; tagOverride?: string }) {
  const tag = tagOverride ?? pet.tag;
  const ageLabel = pet.age < 1 ? `${Math.round(pet.age * 12)} mo` : `${pet.age} yrs`;
  const genderLabel = pet.gender === "male" ? "Male" : "Female";

  return (
    <div className="card pet-card">
      <div className="photo-wrap">
        <img src={pet.img} alt={pet.name} />
        {tag && <span className="tag">{tag}</span>}
        <FavButton petId={pet.id} />
      </div>
      <div className="info">
        <h3>{pet.name}</h3>
        <div className="meta">
          <span>{pet.breed}</span> · <span>{ageLabel}</span> · <span>{genderLabel}</span>
        </div>
        <Link href={`/pet-details?pet=${pet.id}`} className="btn btn-outline">View Profile</Link>
      </div>
    </div>
  );
}
