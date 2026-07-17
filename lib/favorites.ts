// Saved pets ("favorites"), ported from js/main.js.

import { readJSON, writeJSON } from "./storage";

export function getFavorites(): string[] {
  return readJSON<string[]>("pp_favorites", []);
}

export function toggleFavorite(petId: string): boolean {
  let favs = getFavorites();
  if (favs.includes(petId)) {
    favs = favs.filter((id) => id !== petId);
  } else {
    favs.push(petId);
  }
  writeJSON("pp_favorites", favs);
  return favs.includes(petId);
}
