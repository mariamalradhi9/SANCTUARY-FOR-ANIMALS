"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import SmartBackLink from "@/components/site/SmartBackLink";
import PetFacts from "@/components/site/PetFacts";
import BehavioralProfile from "@/components/site/BehavioralProfile";
import PetActivity from "@/components/site/PetActivity";
import BookingWidget from "@/components/site/BookingWidget";
import FavButton from "@/components/site/FavButton";
import { getPublicAnimals } from "@/lib/animals";
import { usePageTitle } from "@/lib/usePageTitle";

function PetDetailsInner() {
  const params = useSearchParams();
  const animals = getPublicAnimals();
  const petId = params.get("pet") || animals[0]?.id;
  const pet = animals.find((p) => p.id === petId) || animals[0];

  usePageTitle(pet ? `${pet.name} — Aamal Almoayyed Sanctuary` : "Pet Profile — Aamal Almoayyed Sanctuary");

  if (!pet) return null;

  return (
    <AuthGuard>
      <SiteHeader active="adopt" />

      <section className="pet-detail">
        <div className="container">
          <SmartBackLink href="/search">← Back to search</SmartBackLink>
          <div className="detail-grid">
            <div className="detail-gallery">
              <img className="main-photo" src={pet.img} alt={pet.name} />
            </div>

            <div className="detail-info">
              {pet.tag && <span className="badge badge-info">{pet.tag}</span>}
              <h1>{pet.name}</h1>
              <p className="detail-sub">{pet.breed} · 📍 Manama, Bahrain</p>

              <PetFacts pet={pet} />

              <h3>About {pet.name}</h3>
              <p>{pet.desc}</p>

              <BehavioralProfile petId={pet.id} petName={pet.name} />
              <PetActivity pet={pet} />

              <div className="detail-actions">
                <Link href={`/adopt?pet=${pet.id}`} className="btn btn-primary">Start Adoption Application</Link>
                <FavButton petId={pet.id} className="fav-btn detail-fav" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingWidget pet={pet} />

      <SiteFooter />
    </AuthGuard>
  );
}

export default function PetDetailsPage() {
  return (
    <Suspense fallback={null}>
      <PetDetailsInner />
    </Suspense>
  );
}
