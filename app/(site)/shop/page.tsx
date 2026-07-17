"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { PRODUCTS, addToCart, getCart, removeFromCart, cartTotal } from "@/lib/cart";
import { formatBHD } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import type { CartItem } from "@/lib/types";

type Category = "all" | "food" | "toys" | "accessories" | "treats";

export default function ShopPage() {
  usePageTitle("Shop — Aamal Almoayyed Sanctuary");
  const router = useRouter();
  const [category, setCategory] = useState<Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  function notifyCartChanged() {
    window.dispatchEvent(new Event("pp:cart-changed"));
  }

  function handleAdd(productId: string) {
    setCart(addToCart(productId));
    notifyCartChanged();
  }

  function handleRemove(productId: string) {
    setCart(removeFromCart(productId));
    notifyCartChanged();
  }

  const products = category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  return (
    <AuthGuard>
      <SiteHeader active="shop" />

      <section className="shop-hero">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Sponsor Our Animals</span>
            <h1>Sponsor Supplies for Animals in Our Care</h1>
            <p>Nothing is shipped to you — every item you sponsor here is used directly at the sanctuary to feed, comfort and care for the animals still waiting for a home.</p>
          </div>
          <div className="shop-tabs">
            {(["all", "food", "toys", "accessories", "treats"] as Category[]).map((c) => (
              <button key={c} className={`shop-tab${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
                {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="shop-section">
        <div className="container shop-layout">
          <div className="product-grid">
            {products.map((p) => (
              <div className="card product-card" key={p.id}>
                <div className="product-photo"><img src={p.img} alt={p.name} /></div>
                <div className="info">
                  <h3>{p.name}</h3>
                  <div className="product-price">{formatBHD(p.price)}</div>
                  <button className="btn btn-primary btn-block" onClick={() => handleAdd(p.id)}>Sponsor This Item</button>
                </div>
              </div>
            ))}
          </div>

          <aside id="cartPanel" className="cart-panel">
            <h3>Your Sponsorship</h3>
            <div>
              {cart.length === 0 ? (
                <p style={{ fontSize: "0.9rem" }}>You haven&apos;t sponsored anything yet.</p>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <span>{item.name} × {item.qty}</span>
                    <span>{formatBHD(item.price * item.qty)}</span>
                    <button className="cart-remove" aria-label="Remove" onClick={() => handleRemove(item.id)}>✕</button>
                  </div>
                ))
              )}
            </div>
            <div className="cart-total">
              <span>Total</span>
              <strong>{formatBHD(cartTotal(cart))}</strong>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                if (cart.length === 0) {
                  alert("You haven't sponsored any supplies yet — add a few items first!");
                  return;
                }
                router.push("/checkout");
              }}
            >
              Continue to Sponsor
            </button>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </AuthGuard>
  );
}
