// Checkout page: shows the cart summary in BHD and simulates placing an order.

function formatBHD(amount) {
  return `${amount.toFixed(3)} BD`;
}

document.addEventListener("DOMContentLoaded", () => {
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = "shop.html";
    return;
  }
  renderSummary(cart);
  bindSmartBack("shop.html");
  document.getElementById("placeOrderBtn").addEventListener("click", handlePlaceOrder);
});

function renderSummary(cart) {
  const el = document.getElementById("checkoutItems");
  el.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <span>${item.name} × ${item.qty}</span>
      <span>${formatBHD(item.price * item.qty)}</span>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("checkoutTotal").textContent = formatBHD(total);
}

function handlePlaceOrder() {
  const requiredIds = ["coName", "coPhone", "coCard", "coExpiry", "coCvv"];

  for (const id of requiredIds) {
    const field = document.getElementById(id);
    if (!field.value.trim()) {
      field.focus();
      alert("Please fill in all fields to confirm your sponsorship.");
      return;
    }
  }

  const orderNumber = "AAM-" + Date.now().toString().slice(-6);
  localStorage.setItem("pp_cart", "[]");
  updateCartBadge();

  document.getElementById("checkoutLayout").style.display = "none";
  const success = document.getElementById("checkoutSuccess");
  document.getElementById("orderNumberText").textContent = `Sponsorship #${orderNumber} confirmed. Our team will use these supplies to care for the animals at the sanctuary.`;
  success.style.display = "block";
}
