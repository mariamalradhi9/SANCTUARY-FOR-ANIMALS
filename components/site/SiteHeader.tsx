"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CartBadge from "./CartBadge";
import { clearSession } from "@/lib/session";

type NavKey = "home" | "adopt" | "shop" | "dashboard";

export default function SiteHeader({ active }: { active?: NavKey }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo">
          <img src="/img/logo.png" alt="Aamal Almoayyed Sanctuary for Animals" className="logo-img" />
          <span className="logo-text">
            <span className="logo-title">Aamal Almoayyed Sanctuary for Animals</span>
            <span className="logo-sub">Run by BARC</span>
          </span>
        </Link>
        <nav className={`nav-links${open ? " nav-open" : ""}`}>
          <Link href="/" className={active === "home" ? "active" : ""}>Home</Link>
          <Link href="/search" className={active === "adopt" ? "active" : ""}>Adopt</Link>
          <Link href="/shop" className={active === "shop" ? "active" : ""}>Shop</Link>
          <Link href="/dashboard" className={active === "dashboard" ? "active" : ""}>Dashboard</Link>
        </nav>
        <div className="header-actions">
          <Link href="/shop#cartPanel" className="icon-btn" aria-label="Cart">
            <img src="/icons/cart.png" alt="" />
            <CartBadge />
          </Link>
          <Link href="/search" className="btn btn-primary btn-sm">Adopt Now</Link>
          <button
            type="button"
            className="btn btn-ghost btn-sm logout-btn"
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
          >
            <img src="/icons/logout.png" alt="" className="btn-icon" /> Logout
          </button>
        </div>
        <button className="nav-toggle" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
