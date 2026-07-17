"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import SmartBackLink from "@/components/site/SmartBackLink";
import { getCart, saveCart, cartTotal } from "@/lib/cart";
import { formatBHD } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import type { CartItem } from "@/lib/types";

export default function CheckoutPage() {
  usePageTitle("Checkout — Aamal Almoayyed Sanctuary");
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[] | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const c = getCart();
    if (c.length === 0) {
      router.replace("/shop");
      return;
    }
    setCart(c);
  }, [router]);

  if (!cart) return null;

  function handlePlaceOrder() {
    if (!name.trim() || !phone.trim() || !card.trim() || !expiry.trim() || !cvv.trim()) {
      alert("Please fill in all fields to confirm your sponsorship.");
      return;
    }

    const num = "AAM-" + Date.now().toString().slice(-6);
    saveCart([]);
    window.dispatchEvent(new Event("pp:cart-changed"));
    setOrderNumber(num);
  }

  return (
    <AuthGuard>
      <SiteHeader active="shop" />

      <section className="checkout-section">
        <div className="container">
          <SmartBackLink href="/shop">← Back to shop</SmartBackLink>

          <div className="section-head" style={{ textAlign: "left", margin: "0 0 32px" }}>
            <span className="eyebrow">Secure Sponsorship</span>
            <h1>Complete Your Sponsorship</h1>
            <p>These supplies stay at the sanctuary — our team will use them to feed and care for the animals in our shelter.</p>
          </div>

          {!orderNumber && (
            <div className="checkout-layout">
              <div className="checkout-form-card">
                <h3>Donor Details</h3>
                <div className="row-2">
                  <div className="field"><label htmlFor="coName">Full Name *</label><input type="text" id="coName" required value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div className="field"><label htmlFor="coPhone">Phone *</label><input type="tel" id="coPhone" required value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                </div>

                <h3>Payment Details</h3>
                <div className="field"><label htmlFor="coCard">Card Number *</label><input type="text" id="coCard" placeholder="1234 5678 9012 3456" maxLength={19} required value={card} onChange={(e) => setCard(e.target.value)} /></div>
                <div className="row-2">
                  <div className="field"><label htmlFor="coExpiry">Expiry *</label><input type="text" id="coExpiry" placeholder="MM/YY" maxLength={5} required value={expiry} onChange={(e) => setExpiry(e.target.value)} /></div>
                  <div className="field"><label htmlFor="coCvv">CVV *</label><input type="text" id="coCvv" placeholder="123" maxLength={3} required value={cvv} onChange={(e) => setCvv(e.target.value)} /></div>
                </div>

                <button type="button" className="btn btn-primary btn-block" onClick={handlePlaceOrder}>Confirm Sponsorship</button>
                <p className="hint" style={{ textAlign: "center", marginTop: 10 }}>This is a demo — no real payment will be processed.</p>
              </div>

              <div className="checkout-summary-card">
                <h3>Sponsorship Summary</h3>
                <div>
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <span>{item.name} × {item.qty}</span>
                      <span>{formatBHD(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="cart-total"><span>Total</span><strong>{formatBHD(cartTotal(cart))}</strong></div>
              </div>
            </div>
          )}

          {orderNumber && (
            <div className="form-card success-box">
              <div className="success-icon">🎉</div>
              <h2>Thank You for Your Sponsorship!</h2>
              <p>Sponsorship #{orderNumber} confirmed. Our team will use these supplies to care for the animals at the sanctuary.</p>
              <a href="/shop" className="btn btn-primary">Sponsor More Supplies</a>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </AuthGuard>
  );
}
