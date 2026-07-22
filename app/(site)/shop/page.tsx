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

const CATEGORY_ICONS: Record<Category, string> = { all: "🐾", food: "🍖", toys: "🧸", accessories: "🎀", treats: "🦴" };

const TRUST_BADGES = [
  { icon: "/icons/paw.png", title: "100% Used at the Sanctuary", text: "All items go directly to the animals in our care." },
  { icon: "/icons/lock.png", title: "Trusted & Safe Products", text: "We choose high-quality, animal-safe supplies." },
  { icon: "/icons/heart.png", title: "Make a Real Difference", text: "Your support helps us provide better care every day." },
  { icon: "/icons/setting.png", title: "Sponsor with Love", text: "Every small act of kindness means the world." },
];

export default function ShopPage() {
  usePageTitle("Shop — Aamal Almoayyed Sanctuary");
  const router = useRouter();
  const [category, setCategory] = useState<Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, number>>({});

  useEffect(() => {
    setCart(getCart());
  }, []);

  function notifyCartChanged() {
    window.dispatchEvent(new Event("pp:cart-changed"));
  }

  function qtyFor(productId: string) {
    return qtyDrafts[productId] ?? 1;
  }

  function adjustQty(productId: string, delta: number) {
    setQtyDrafts((prev) => ({ ...prev, [productId]: Math.max(1, qtyFor(productId) + delta) }));
  }

  function handleAdd(productId: string) {
    setCart(addToCart(productId, qtyFor(productId)));
    setQtyDrafts((prev) => ({ ...prev, [productId]: 1 }));
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
        <div className="container shop-hero-layout">
          <img className="shop-hero-photo" src="/img/shop.png" alt="A dog and cat sitting together, ready to be sponsored" />
          <div>
            <div className="section-head" style={{ textAlign: "left", margin: 0 }}>
              <span className="eyebrow">Sponsor Our Animals</span>
              <h1>Sponsor Supplies for Animals <span className="shop-hero-highlight">in Our Care <span aria-hidden>🐾</span></span></h1>
              <p>Nothing is shipped to you — every item you sponsor here is used directly at the sanctuary to feed, comfort and care for the animals still waiting for a home.</p>
            </div>
            <div className="shop-tabs">
              {(["all", "food", "toys", "accessories", "treats"] as Category[]).map((c) => (
                <button key={c} className={`shop-tab${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
                  <span aria-hidden>{CATEGORY_ICONS[c]}</span> {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
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
                  <span className="badge badge-info product-category-badge">{p.category.charAt(0).toUpperCase() + p.category.slice(1)}</span>
                  <h3>{p.name}</h3>
                  <div className="product-price">{formatBHD(p.price)}</div>
                  <div className="product-qty-row">
                    <div className="qty-stepper">
                      <button type="button" onClick={() => adjustQty(p.id, -1)} aria-label="Decrease quantity">−</button>
                      <span>{qtyFor(p.id)}</span>
                      <button type="button" onClick={() => adjustQty(p.id, 1)} aria-label="Increase quantity">+</button>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleAdd(p.id)}><img src="/icons/cart.png" alt="" className="btn-icon" /> Sponsor Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside id="cartPanel" className="cart-panel">
            <div className="cart-panel-head">
              <h3>Your Sponsorship</h3>
              <div className="cart-panel-icon"><img src="/icons/heart.png" alt="" /></div>
            </div>
            <div>
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <img src="/img/application.png" alt="" />
                  <p>You haven&apos;t sponsored anything yet.</p>
                </div>
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
              <img src="/icons/cart.png" alt="" className="btn-icon" /> View Cart ({cart.length})
            </button>
            <p className="cart-panel-footnote">Every item makes a difference <span aria-hidden>🧡</span></p>
          </aside>
        </div>

        <div className="container">
          <div className="trust-badge-row">
            {TRUST_BADGES.map((b) => (
              <div className="trust-badge" key={b.title}>
                <div className="trust-badge-icon"><img src={b.icon} alt="" /></div>
                <div>
                  <strong>{b.title}</strong>
                  <p>{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </AuthGuard>
  );
}
