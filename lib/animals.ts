// Ported 1:1 from the static prototype's js/pets-data.js. PETS is the default
// seed catalog; getAnimals()/saveAnimals() give the admin Animals page a
// persistent (localStorage) copy that every page reads from, so admin
// add/edit/delete actions are reflected site-wide without a backend.

import type { Animal } from "./types";
import { readJSON, writeJSON } from "./storage";
import { getApplications } from "./records";

export const PETS: Animal[] = [
  { id: "mateus", name: "Mateus", species: "dog", emoji: "🐶", img: "/img/Adopt/Mateus.png", breed: "Golden Retriever", dob: "2024-07-22", size: "large", gender: "male", tag: "New", available: true, desc: "Mateus is a playful, affectionate Golden Retriever who loves long walks, fetch, and belly rubs. He's great with kids and other dogs, and already knows sit, stay, and paw.", kennelNumber: "K-01", kennelInCharge: "Sara Ahmed", aggressionLevel: "Low", onboardingDate: "2026-06-01", medicalStatus: "Healthy", vaccinationStatus: "Up to Date", nutritionStatus: "Good", nextVetCheckDue: "2026-08-15" },
  { id: "biscuit", name: "Biscuit", species: "rabbit", emoji: "🐰", img: "/img/Adopt/Biscuit.png", breed: "Lop-Eared", dob: "2025-11-08", size: "small", gender: "male", tag: "New", available: true, desc: "Biscuit is a gentle lop-eared rabbit who enjoys quiet company and fresh greens. He's litter-trained and does best in a calm, low-traffic home.", kennelNumber: "K-02", kennelInCharge: "Sara Ahmed", aggressionLevel: "Low", onboardingDate: "2026-07-10", medicalStatus: "Healthy", vaccinationStatus: "Up to Date", nutritionStatus: "Good", nextVetCheckDue: "2026-09-01" },
  { id: "mochi", name: "Mochi", species: "cat", emoji: "🐱", img: "/img/Adopt/Mochi.png", breed: "Tabby", dob: "2025-01-22", size: "medium", gender: "female", tag: "Popular", available: true, desc: "Mochi is a curious tabby cat with a soft spot for sunny windowsills and cardboard boxes. Independent but affectionate, she'll happily curl up on your lap after a day of play.", kennelNumber: "K-03", kennelInCharge: "Yousif Khalid", aggressionLevel: "Low", onboardingDate: "2026-01-15", medicalStatus: "Healthy", vaccinationStatus: "Up to Date", nutritionStatus: "Good", nextVetCheckDue: "2026-07-05" },
  { id: "shiba", name: "Shiba", species: "dog", emoji: "🐶", img: "/img/Adopt/Shiba.png", breed: "Shiba Inu", dob: "2023-07-22", size: "medium", gender: "male", tag: "Urgent", available: true, desc: "Shiba is a confident, alert companion who loves exploring the outdoors. He's house-trained and does best with an experienced, active owner.", kennelNumber: "K-04", kennelInCharge: "Yousif Khalid", aggressionLevel: "Medium", onboardingDate: "2025-10-01", medicalStatus: "Under Treatment", vaccinationStatus: "Up to Date", nutritionStatus: "Good", nextVetCheckDue: "2026-07-18" },
  { id: "eddy", name: "Eddy", species: "dog", emoji: "🐶", img: "/img/Adopt/Eddy.png", breed: "Beagle Mix", dob: "2022-07-22", size: "medium", gender: "male", tag: "", available: true, desc: "Eddy is a friendly beagle mix with a great nose for adventure. He gets along with everyone and loves a good sniff around the yard.", kennelNumber: "K-05", kennelInCharge: "Mona Saeed", aggressionLevel: "Low", onboardingDate: "2026-05-01", medicalStatus: "Healthy", vaccinationStatus: "Up to Date", nutritionStatus: "Good", nextVetCheckDue: "2026-08-01" },
  { id: "cloty", name: "Cloty", species: "rabbit", emoji: "🐰", img: "/img/Adopt/Cloty.png", breed: "Dutch Rabbit", dob: "2025-07-22", size: "small", gender: "female", tag: "", available: true, desc: "Cloty is a sweet, social dutch rabbit who loves hopping around supervised playtime and nibbling on herbs.", kennelNumber: "K-06", kennelInCharge: "Mona Saeed", aggressionLevel: "Low", onboardingDate: "2026-07-15", medicalStatus: "Healthy", vaccinationStatus: "Up to Date", nutritionStatus: "Good", nextVetCheckDue: "2026-09-10" },
  { id: "luna", name: "Luna", species: "cat", emoji: "🐱", img: "/img/Adopt/Luna.png", breed: "Siamese", dob: "2024-07-22", size: "medium", gender: "female", tag: "Popular", available: true, desc: "Luna is a vocal, people-oriented Siamese who will happily narrate your entire day. She loves interactive toys and warm laps.", kennelNumber: "K-07", kennelInCharge: "Sara Ahmed", aggressionLevel: "Medium", onboardingDate: "2026-03-01", medicalStatus: "Healthy", vaccinationStatus: "Due", nutritionStatus: "Good", nextVetCheckDue: "2026-08-20" },
  { id: "rocky", name: "Rocky", species: "dog", emoji: "🐶", img: "/img/Adopt/Rocky.png", breed: "Bulldog", dob: "2021-07-22", size: "large", gender: "male", tag: "", available: false, desc: "Rocky is a laid-back bulldog who is content with short walks and long naps. Perfect for a relaxed household.", kennelNumber: "K-08", kennelInCharge: "Yousif Khalid", aggressionLevel: "High", onboardingDate: "2025-06-01", medicalStatus: "Critical", vaccinationStatus: "Up to Date", nutritionStatus: "Needs Improvement", nextVetCheckDue: "2026-07-20" },
  { id: "hazel", name: "Hazel", species: "rabbit", emoji: "🐰", img: "/img/Adopt/Hazel.png", breed: "Mini Rex", dob: "2025-05-08", size: "small", gender: "female", tag: "New", available: true, desc: "Hazel is an energetic mini rex who loves toys she can toss and chase. She's bonded well with other rabbits in foster care.", kennelNumber: "K-09", kennelInCharge: "Mona Saeed", aggressionLevel: "Low", onboardingDate: "2026-06-20", medicalStatus: "Healthy", vaccinationStatus: "Up to Date", nutritionStatus: "Good", nextVetCheckDue: "2026-08-25" },
];

const KEY = "pp_animals";

export function getAnimals(): Animal[] {
  const stored = readJSON<Animal[] | null>(KEY, null);
  if (stored) return stored;
  const seeded = JSON.parse(JSON.stringify(PETS)) as Animal[];
  writeJSON(KEY, seeded);
  return seeded;
}

export function saveAnimals(list: Animal[]): void {
  writeJSON(KEY, list);
}

export function addAnimal(animal: Animal): void {
  const list = getAnimals();
  list.push(animal);
  saveAnimals(list);
}

export function updateAnimal(id: string, changes: Partial<Animal>): void {
  const list = getAnimals();
  const animal = list.find((a) => a.id === id);
  if (animal) Object.assign(animal, changes);
  saveAnimals(list);
}

export function deleteAnimal(id: string): void {
  saveAnimals(getAnimals().filter((a) => a.id !== id));
}

/** True once any of this animal's adoption applications has been Approved. */
export function isAnimalAdopted(petId: string): boolean {
  return getApplications().some((a) => a.petId === petId && a.status === "Approved");
}

/** Availability shown to the public: the admin's manual toggle, overridden to
 * unavailable the moment an application for this animal is Approved. */
export function isAnimalAvailable(animal: Animal): boolean {
  if (animal.available === false) return false;
  return !isAnimalAdopted(animal.id);
}

/** Animals visible anywhere on the public site (Home, Search) — excludes hidden ones. */
export function getPublicAnimals(): Animal[] {
  return getAnimals().filter((a) => !a.hidden);
}
