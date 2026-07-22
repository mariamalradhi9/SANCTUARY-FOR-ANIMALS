"use client";

import { useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PetCard from "@/components/site/PetCard";
import { getPublicAnimals, isAnimalAvailable } from "@/lib/animals";
import { calculateAge } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";

type Sort = "name" | "age-asc" | "age-desc";

export default function SearchPage() {
  usePageTitle("Adopt — Aamal Almoayyed Sanctuary");

  const [searchInput, setSearchInput] = useState("");
  const [species, setSpecies] = useState("");
  const [size, setSize] = useState("");
  const [gender, setGender] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [sort, setSort] = useState<Sort>("name");
  const [applied, setApplied] = useState({ search: "", species: "", size: "", gender: "", maxAge: "", sort: "name" as Sort });

  const animals = useMemo(() => getPublicAnimals(), []);

  const results = useMemo(() => {
    const { search, species, size, gender, maxAge, sort } = applied;
    let result = animals.filter((pet) => isAnimalAvailable(pet)).filter((pet) => {
      if (search && !pet.name.toLowerCase().includes(search) && !pet.breed.toLowerCase().includes(search)) return false;
      if (species && pet.species !== species) return false;
      if (size && pet.size !== size) return false;
      if (gender && pet.gender !== gender) return false;
      if (maxAge && calculateAge(pet.dob) >= Number(maxAge)) return false;
      return true;
    });

    result = result.slice();
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "age-asc") result.sort((a, b) => calculateAge(a.dob) - calculateAge(b.dob));
    if (sort === "age-desc") result.sort((a, b) => calculateAge(b.dob) - calculateAge(a.dob));
    return result;
  }, [animals, applied]);

  function applyFilters() {
    setApplied({ search: searchInput.trim().toLowerCase(), species, size, gender, maxAge, sort });
  }

  function resetFilters() {
    setSearchInput("");
    setSpecies("");
    setSize("");
    setGender("");
    setMaxAge("");
    setSort("name");
    setApplied({ search: "", species: "", size: "", gender: "", maxAge: "", sort: "name" });
  }

  return (
    <AuthGuard>
      <SiteHeader active="adopt" />

      <section className="search-hero">
        <div className="container">
          <h1>Search &amp; Find a Companion</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name or breed…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
            />
            <button className="btn btn-primary" onClick={applyFilters}>Search</button>
          </div>
        </div>
      </section>

      <section className="results">
        <div className="container results-grid">
          <div className="grid-3 pet-grid">
            {results.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>
                No pets match your filters. Try broadening your search.
              </p>
            ) : (
              results.map((pet) => <PetCard key={pet.id} pet={pet} />)
            )}
          </div>

          <aside className="filter-panel">
            <h3>Advanced Filter</h3>

            <div className="field">
              <label htmlFor="fSpecies">Species</label>
              <select id="fSpecies" value={species} onChange={(e) => setSpecies(e.target.value)}>
                <option value="">All</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="rabbit">Rabbit</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="fSize">Size</label>
              <select id="fSize" value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="">Any</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="fGender">Gender</label>
              <select id="fGender" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="fAge">Max Age (years)</label>
              <select id="fAge" value={maxAge} onChange={(e) => setMaxAge(e.target.value)}>
                <option value="">Any</option>
                <option value="1">Under 1</option>
                <option value="2">Under 2</option>
                <option value="5">Under 5</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="fSort">Sort By</label>
              <select id="fSort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="name">Name (A–Z)</option>
                <option value="age-asc">Youngest First</option>
                <option value="age-desc">Oldest First</option>
              </select>
            </div>

            <button className="btn btn-primary btn-block" onClick={applyFilters}>Apply Filters</button>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={resetFilters}>Reset</button>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </AuthGuard>
  );
}
