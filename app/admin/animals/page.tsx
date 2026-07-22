"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AnimalFormModal, { type AnimalFormData } from "@/components/admin/AnimalFormModal";
import AnimalHistoryModal from "@/components/admin/AnimalHistoryModal";
import AnimalViewModal from "@/components/admin/AnimalViewModal";
import ConfirmModal from "@/components/ConfirmModal";
import { addAnimal, deleteAnimal, getAnimals, updateAnimal } from "@/lib/animals";
import { logAudit } from "@/lib/admin/audit";
import { useToast } from "@/lib/admin/useToast";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Animal, Species } from "@/lib/types";

const NO_PHOTO_IMG = "/icons/paw.png";

type AvailFilter = "" | "available" | "unavailable";

export default function AdminAnimalsPage() {
  usePageTitle("Animals — Admin — Aamal Almoayyed Sanctuary");
  const { message, show, showToast } = useToast();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState<"" | Species>("");
  const [avail, setAvail] = useState<AvailFilter>("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [historyPetId, setHistoryPetId] = useState<string | null>(null);
  const [viewingAnimal, setViewingAnimal] = useState<Animal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Animal | null>(null);

  useEffect(() => {
    setAnimals(getAnimals());
  }, []);

  const filtered = useMemo(() => {
    let list = animals;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((a) => a.name.toLowerCase().includes(q) || a.breed.toLowerCase().includes(q));
    if (species) list = list.filter((a) => a.species === species);
    if (avail === "available") list = list.filter((a) => a.available !== false);
    if (avail === "unavailable") list = list.filter((a) => a.available === false);
    return list;
  }, [animals, search, species, avail]);

  function openAddModal() {
    setEditingAnimal(null);
    setFormOpen(true);
  }

  function openEditModal(a: Animal) {
    setEditingAnimal(a);
    setFormOpen(true);
  }

  function handleSave(data: AnimalFormData) {
    if (editingAnimal) {
      updateAnimal(editingAnimal.id, data);
      logAudit("animal-update", `${data.name}'s record was updated.`);
      showToast(`${data.name} updated.`);
    } else {
      const id = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
      const emoji = data.species === "dog" ? "🐶" : data.species === "cat" ? "🐱" : "🐰";
      addAnimal({ ...data, id, emoji, tag: "New" });
      logAudit("animal-onboarded", `${data.name} was onboarded into the catalog.`);
      showToast(`${data.name} added to the catalog.`);
    }
    setAnimals(getAnimals());
    setFormOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteAnimal(deleteTarget.id);
    logAudit("animal-deleted", `${deleteTarget.name} was removed from the catalog.`);
    showToast(`${deleteTarget.name} removed.`);
    setAnimals(getAnimals());
    setDeleteTarget(null);
  }

  return (
    <AuthGuard>
      <div className="admin-app">
        <AdminTopbar active="animals" />

        <main className="admin-main">
          <div className="container">
            <div className={`admin-toast${show ? " show" : ""}`}>{message}</div>

            <div className="section-head admin-head">
              <span className="eyebrow">Catalog</span>
              <h1>Animals</h1>
              <p>Manage animal profiles, availability and assessment records.</p>
            </div>

            <div className="admin-toolbar">
              <input type="text" placeholder="Search animals…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select value={species} onChange={(e) => setSpecies(e.target.value as "" | Species)}>
                <option value="">All species</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="rabbit">Rabbit</option>
              </select>
              <select value={avail} onChange={(e) => setAvail(e.target.value as AvailFilter)}>
                <option value="">All statuses</option>
                <option value="available">Available</option>
                <option value="unavailable">Not Available</option>
              </select>
              <button type="button" className="btn btn-primary" onClick={openAddModal}>+ Add Animal</button>
            </div>

            {filtered.length === 0 ? (
              <p className="admin-empty">No animals match your search.</p>
            ) : (
              <div className="grid-3">
                {filtered.map((a) => {
                  const tags = [a.gender === "male" ? "Male" : "Female", a.size ? a.size.charAt(0).toUpperCase() + a.size.slice(1) : ""].filter(Boolean);
                  return (
                    <div className="card animal-card" key={a.id}>
                      <div className="photo-wrap">
                        <img src={a.img || NO_PHOTO_IMG} alt={a.name} />
                        <span className={`animal-status-badge ${a.available !== false ? "available" : "unavailable"}`}>
                          {a.available !== false ? "Available" : "Not Available"}
                        </span>
                      </div>
                      <div className="info">
                        <h3>{a.name}</h3>
                        <div className="meta">
                          <span>{a.species.charAt(0).toUpperCase() + a.species.slice(1)} · {a.breed}</span> · <span>{a.age} {a.age === 1 ? "year" : "years"}</span>
                        </div>
                        <div className="animal-tags">
                          {tags.map((t) => <span key={t}>{t}</span>)}
                        </div>
                        <div className="animal-card-actions">
                          <button type="button" className="btn btn-ghost" onClick={() => setViewingAnimal(a)}>View</button>
                          <button type="button" className="btn btn-outline" onClick={() => openEditModal(a)}>Edit</button>
                          <a href={`/admin/assessment?pet=${a.id}`} className="btn btn-ghost"><img src="/icons/assessment.png" alt="" className="icon-img-sm" /> Assessment</a>
                          <button type="button" className="btn btn-ghost" onClick={() => setHistoryPetId(a.id)}><img src="/icons/history.png" alt="" className="icon-img-sm" /> History</button>
                          <button type="button" className="btn btn-ghost" style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }} onClick={() => setDeleteTarget(a)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimalFormModal open={formOpen} animal={editingAnimal} onClose={() => setFormOpen(false)} onSave={handleSave} />
      <AnimalHistoryModal petId={historyPetId} onClose={() => setHistoryPetId(null)} />
      <AnimalViewModal animal={viewingAnimal} onClose={() => setViewingAnimal(null)} />
      <ConfirmModal
        open={!!deleteTarget}
        title="Remove Animal"
        message={`Remove ${deleteTarget?.name} from the catalog? This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AuthGuard>
  );
}
