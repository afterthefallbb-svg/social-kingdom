import React from "react";
import LinedText from "@/components/planner/LinedText";

// Numbered dotted lines with an optional small date line, and an "add" link below.
export default function NumberedList({ items, onChange, addLabel, withDate = false }) {
  const set = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-end gap-1.5">
          <span className="text-base font-semibold text-gray-700 w-6 shrink-0 leading-7">{i + 1}</span>
          <LinedText value={it.text} onChange={(v) => set(i, { text: v })} />
          {withDate && (
            <input
              value={it.date || ""}
              onChange={(e) => set(i, { date: e.target.value })}
              placeholder="date"
              className="w-16 shrink-0 bg-transparent outline-none text-sm text-gray-500 border-b-2 border-dotted border-gray-300 leading-7"
            />
          )}
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { text: "" }])}
        className="text-sm font-medium ml-7"
        style={{ color: "#1877f2" }}
      >
        {addLabel}
      </button>
    </div>
  );
}