import React from "react";
import { CATEGORIES } from "@/lib/categories";

// Horizontal scrolling row of plain text links that float over the map.
// No background boxes — raw text only, with a shadow for legibility.
export default function CategoryFilter({ active, onSelect }) {
  return (
    <div className="flex gap-5 overflow-x-auto no-scrollbar px-4 py-1">
      {CATEGORIES.map((c) => {
        const on = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id === active ? null : c.id)}
            className="whitespace-nowrap text-[13px] font-semibold transition-colors"
            style={{
              color: on ? "#ffffff" : "rgba(255,255,255,0.92)",
              textShadow: "0 1px 4px rgba(0,0,0,0.75)",
              borderBottom: on ? "2px solid #ffffff" : "2px solid transparent",
              paddingBottom: 1
            }}
          >
            {c.label.toLowerCase()}
          </button>
        );
      })}
    </div>
  );
}