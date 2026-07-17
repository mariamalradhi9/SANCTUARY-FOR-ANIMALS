"use client";

import { useEffect, useState } from "react";
import { cartCount, getCart } from "@/lib/cart";

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(cartCount(getCart()));
    const onStorage = () => setCount(cartCount(getCart()));
    window.addEventListener("storage", onStorage);
    window.addEventListener("pp:cart-changed", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pp:cart-changed", onStorage);
    };
  }, []);

  return (
    <span className="badge" style={{ display: count > 0 ? "flex" : "none" }}>
      {count}
    </span>
  );
}
