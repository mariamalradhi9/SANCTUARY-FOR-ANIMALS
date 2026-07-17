// Product grid, category filter, and cart logic for shop.html

const PRODUCTS = [
  { id: "kibble-dog", name: "Grain-Free Dog Kibble", category: "food", price: 6.950 },
  { id: "kibble-cat", name: "Salmon Cat Kibble", category: "food", price: 5.250 },
  { id: "hay-rabbit", name: "Timothy Hay Bag", category: "food", price: 3.400 },
  { id: "rope-toy", name: "Rope Tug Toy", category: "toys", price: 2.450 },
  { id: "feather-wand", name: "Feather Wand Toy", category: "toys", price: 1.900 },
  { id: "puzzle-toy", name: "Treat Puzzle Feeder", category: "toys", price: 4.500 },
  { id: "collar", name: "Adjustable Collar", category: "accessories", price: 3.000 },
  { id: "carrier", name: "Pet Travel Carrier", category: "accessories", price: 13.500 },
  { id: "bed", name: "Cozy Pet Bed", category: "accessories", price: 9.000 },
  { id: "biscuits", name: "Peanut Butter Biscuits", category: "treats", price: 1.700 },
  { id: "dental-chew", name: "Dental Chew Sticks", category: "treats", price: 2.650 },
  { id: "catnip", name: "Organic Catnip Pouch", category: "treats", price: 1.300 },
].map((p) => ({ ...p, img: `img/Shop/${p.name}.png` }));

function formatBHD(amount) {
  return `${amount.toFixed(3)} BD`;
}

let activeCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();

  document.querySelectorAll(".shop-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCategory = tab.dataset.cat;
      document.querySelectorAll(".shop-tab").forEach((t) => t.classList.toggle("active", t === tab));
      renderProducts();
    });
  });

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    const cart = getCart();
    if (cart.length === 0) {
      alert("You haven't sponsored any supplies yet — add a few items first!");
      return;
    }
    window.location.href = "checkout.html";
  });
});

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const list = activeCategory === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);

  grid.innerHTML = list.map((p) => `
    <div class="card product-card">
      <div class="product-photo"><img src="${p.img}" alt="${p.name}"></div>
      <div class="info">
        <h3>${p.name}</h3>
        <div class="product-price">${formatBHD(p.price)}</div>
        <button class="btn btn-primary btn-block add-to-cart" data-id="${p.id}">Sponsor This Item</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });
}

function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }
  localStorage.setItem("pp_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  localStorage.setItem("pp_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const el = document.getElementById("cartItems");

  if (cart.length === 0) {
    el.innerHTML = `<p style="font-size:0.9rem;">You haven't sponsored anything yet.</p>`;
  } else {
    el.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <span>${item.name} × ${item.qty}</span>
        <span>${formatBHD(item.price * item.qty)}</span>
        <button class="cart-remove" data-id="${item.id}" aria-label="Remove">✕</button>
      </div>
    `).join("");
    el.querySelectorAll(".cart-remove").forEach((btn) => {
      btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
    });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("cartTotal").textContent = formatBHD(total);
}
