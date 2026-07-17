// Shared behavior across all pages: nav toggle, favorites, cart badge.

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initFooterYear();
  initFavorites();
  updateCartBadge();
});

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("nav-open");
    toggle.textContent = isOpen ? "✕" : "☰";
  });
}

function initFooterYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = new Date().getFullYear();
}

// ---- Favorites (saved pets), persisted in localStorage ----

function getFavorites() {
  return JSON.parse(localStorage.getItem("pp_favorites") || "[]");
}

function toggleFavorite(petId) {
  let favs = getFavorites();
  if (favs.includes(petId)) {
    favs = favs.filter((id) => id !== petId);
  } else {
    favs.push(petId);
  }
  localStorage.setItem("pp_favorites", JSON.stringify(favs));
  return favs.includes(petId);
}

function initFavorites() {
  document.querySelectorAll(".fav-btn").forEach((btn) => {
    const petId = btn.dataset.petId;
    if (!petId) return;
    if (getFavorites().includes(petId)) btn.classList.add("active");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isActive = toggleFavorite(petId);
      btn.classList.toggle("active", isActive);
    });
  });
}

// ---- Shop cart badge ----

function getCart() {
  return JSON.parse(localStorage.getItem("pp_cart") || "[]");
}

function updateCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

// ---- Session / logout ----

function getSession() {
  return JSON.parse(localStorage.getItem("pp_session") || "null");
}

function logout(redirectTo) {
  localStorage.removeItem("pp_session");
  window.location.href = redirectTo || "login.html";
}

// ---- Smart back link: returns the visitor to the page they actually came from
// (within this site) instead of always the same hardcoded destination. ----

function bindSmartBack(fallbackHref) {
  const link = document.querySelector(".back-link");
  if (!link) return;
  link.addEventListener("click", (e) => {
    const cameFromSite = document.referrer && document.referrer.startsWith(window.location.origin);
    if (cameFromSite && window.history.length > 1) {
      e.preventDefault();
      window.history.back();
    }
    // otherwise let the normal href navigation to fallbackHref proceed
  });
}
