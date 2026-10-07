import React from "react";
import { CATEGORIES } from "@/lib/categories";

// Horizontal scrolling row of plain text links that float over the map.
export default function CategoryFilter({ active, onSelect }) {
  return (
    <div className="flex gap-5 overflow-x-auto no-scrollbar px-4 py-1">
      {CATEGORIES.map((c) => {
        const on = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id === active ? null : c.id)}
            className="whitespace-nowrap text-[13px] transition-colors"
            style={{
              color: "#111111",
              textShadow: "0 1px 4px rgba(255,255,255,0.95)",
              borderBottom: on ? "2px solid #111111" : "2px solid transparent",
              paddingBottom: 1,
              fontWeight: on ? 800 : 600
            }}
          >
            {c.label.toLowerCase()}
          </button>
        );
      })}
    </div>
  );
}