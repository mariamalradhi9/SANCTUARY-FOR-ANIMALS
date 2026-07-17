// Renders and filters the pet grid on search.html using getAnimals() from pets-data.js

function renderPets(list) {
  const grid = document.getElementById("petGrid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:40px 0;">
      No pets match your filters. Try broadening your search.</p>`;
    return;
  }

  grid.innerHTML = list.map((pet) => `
    <div class="card pet-card">
      <div class="photo-wrap">
        <img src="${pet.img}" alt="${pet.name}">
        ${pet.tag ? `<span class="tag">${pet.tag}</span>` : ""}
        <button class="fav-btn" data-pet-id="${pet.id}" aria-label="Save">🤍</button>
      </div>
      <div class="info">
        <h3>${pet.name}</h3>
        <div class="meta"><span>${pet.breed}</span> · <span>${pet.age < 1 ? Math.round(pet.age * 12) + " mo" : pet.age + " yrs"}</span> · <span>${pet.gender === "male" ? "Male" : "Female"}</span></div>
        <a href="pet-details.html?pet=${pet.id}" class="btn btn-outline">View Profile</a>
      </div>
    </div>
  `).join("");

  initFavorites();
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const species = document.getElementById("fSpecies").value;
  const size = document.getElementById("fSize").value;
  const gender = document.getElementById("fGender").value;
  const maxAge = document.getElementById("fAge").value;
  const sort = document.getElementById("fSort").value;

  let result = getAnimals().filter((pet) => pet.available !== false).filter((pet) => {
    if (search && !pet.name.toLowerCase().includes(search) && !pet.breed.toLowerCase().includes(search)) return false;
    if (species && pet.species !== species) return false;
    if (size && pet.size !== size) return false;
    if (gender && pet.gender !== gender) return false;
    if (maxAge && pet.age >= Number(maxAge)) return false;
    return true;
  });

  if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "age-asc") result.sort((a, b) => a.age - b.age);
  if (sort === "age-desc") result.sort((a, b) => b.age - a.age);

  renderPets(result);
}

document.addEventListener("DOMContentLoaded", () => {
  renderPets(getAnimals().filter((pet) => pet.available !== false));
  document.getElementById("applyFilters").addEventListener("click", applyFilters);
  document.getElementById("searchBtn").addEventListener("click", applyFilters);
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyFilters();
  });
  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("fSpecies").value = "";
    document.getElementById("fSize").value = "";
    document.getElementById("fGender").value = "";
    document.getElementById("fAge").value = "";
    document.getElementById("fSort").value = "name";
    document.getElementById("searchInput").value = "";
    renderPets(getAnimals().filter((pet) => pet.available !== false));
  });
});
