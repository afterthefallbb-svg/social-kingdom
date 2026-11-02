import React from "react";
import { CATEGORIES } from "@/lib/categories";

/* Neon category chips over the map — "All Events" clears the filter. */
const TONES = ["ice", "blue", "violet", "gold", "rose"];

export default function MapCategoryBar({ active, onSelect }) {
  return (
    <div className="sk-map-cats no-scrollbar" data-tour="categories">
      <button
        type="button"
        onClick={() => onSelect(null)}
        data-tone="ice"
        className={`sk-cat${active ? "" : " sk-cat-on"}`}
      >
        <span className="sk-cat-icon">✦</span>
        All Events
      </button>
      {CATEGORIES.map((c, i) => (
        <button
          key={c.id}
          type="button"
          data-tone={TONES[i % TONES.length]}
          onClick={() => onSelect(c.id === active ? null : c.id)}
          className={`sk-cat${active === c.id ? " sk-cat-on" : ""}`}
        >
          <span className="sk-cat-icon">{c.emoji}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}