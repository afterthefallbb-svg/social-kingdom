import React from "react";
import { CATEGORIES } from "@/lib/categories";

/* Scrolling pill categories above the map — "All Events" clears the filter. */
export default function MapCategoryBar({ active, onSelect }) {
  return (
    <div className="sk-map-cats no-scrollbar" data-tour="categories">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`sk-cat${active ? "" : " sk-cat-on"}`}
      >
        <span className="sk-cat-icon">✦</span>
        All Events
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
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