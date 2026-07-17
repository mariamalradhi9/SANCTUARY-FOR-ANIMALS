import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PetCard from "@/components/site/PetCard";
import { PETS } from "@/lib/animals";

export default function HomePage() {
  const mateus = PETS.find((p) => p.id === "mateus")!;
  const mochi = PETS.find((p) => p.id === "mochi")!;
  const biscuit = PETS.find((p) => p.id === "biscuit")!;

  return (
    <AuthGuard>
      <SiteHeader active="home" />

      <section className="hero">
        <video className="hero-bg-img" autoPlay muted loop playsInline poster="/img/background.png">
          <source src="/video/background.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-copy">
            <span className="eyebrow">Bahrain&apos;s Biggest Sanctuary</span>
            <h1>Find Your<br />Forever Friend</h1>
            <p>
              Every year we rescue, rehabilitate and rehome hundreds of dogs, cats and rabbits. Browse our available
              animals and open your home to one who needs it most.
            </p>
            <div className="hero-actions">
              <Link href="/search" className="btn btn-primary">Browse Pets</Link>
              <Link href="#how-it-works" className="btn btn-outline">How Adoption Works</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container grid-4">
          <div className="stat"><h2>1,200+</h2><p>Animals Rescued</p></div>
          <div className="stat"><h2>860</h2><p>Successful Adoptions</p></div>
          <div className="stat"><h2>45</h2><p>Volunteers</p></div>
          <div className="stat"><h2>12</h2><p>Years of Service</p></div>
        </div>
      </section>

      <section className="featured">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Meet Them</span>
            <h2>Our Featured Companions</h2>
            <p>A few of the animals currently waiting for a loving home.</p>
          </div>
          <div className="grid-3">
            <PetCard pet={mateus} tagOverride="Dog" />
            <PetCard pet={mochi} tagOverride="Cat" />
            <PetCard pet={biscuit} tagOverride="Rabbit" />
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link href="/search" className="btn btn-primary">See All Available Pets</Link>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Simple Process</span>
            <h2>How Adoption Works</h2>
          </div>
          <div className="grid-3">
            <div className="step-card">
              <div className="step-icon">🔍</div>
              <h3>1. Browse &amp; Search</h3>
              <p>Filter by species, breed, age and size to find your match.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">📝</div>
              <h3>2. Submit Application</h3>
              <p>Tell us about your home and lifestyle in our adoption form.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🏡</div>
              <h3>3. Welcome Them Home</h3>
              <p>Meet your new companion and complete the adoption.</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </AuthGuard>
  );
}
