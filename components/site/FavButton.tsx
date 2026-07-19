"use client";

import { useEffect, useState } from "react";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

export default function FavButton({ petId, className = "fav-btn" }: { petId: string; className?: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(getFavorites().includes(petId));
  }, [petId]);

  return (
    <button
      type="button"
      className={`${className}${active ? " active" : ""}`}
      aria-label={active ? "Remove" : "Save"}
      onClick={(e) => {
        e.preventDefault();
        setActive(toggleFavorite(petId));
      }}
    >
      <img src="/icons/heart.png" alt="" />
    </button>
  );
}
