import React from "react";
import { CATEGORIES } from "@/lib/categories";
import GlassToggle from "@/components/theme/GlassToggle";

const TONES = ["ice", "blue", "violet", "gold", "rose"];

export default function EventCategoryPicker({ category, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-kingdom-muted">Category</label>
      <div className="flex flex-wrap gap-2 mt-1.5">
        {CATEGORIES.map((c, i) => (
          <GlassToggle
            key={c.id}
            tone={TONES[i % TONES.length]}
            selected={category === c.id}
            onClick={() => onChange(c.id)}
            className="gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            <span aria-hidden="true">{c.emoji}</span> {c.label}
          </GlassToggle>
        ))}
      </div>
    </div>
  );
}