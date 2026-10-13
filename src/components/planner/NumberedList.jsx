import React from "react";
import LinedText from "@/components/planner/LinedText";

// Numbered dotted lines with an optional small date line, and an "add" link below.
export default function NumberedList({ items, onChange, addLabel, withDate = false }) {
  const set = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-end gap-1.5">
          <span className="text-sm font-semibold text-gray-700 w-5 shrink-0 leading-6">{i + 1}</span>
          <LinedText value={it.text} onChange={(v) => set(i, { text: v })} />
          {withDate && (
            <input
              value={it.date || ""}
              onChange={(e) => set(i, { date: e.target.value })}
              placeholder="date"
              className="w-12 shrink-0 bg-transparent outline-none text-[10px] text-gray-500 border-b-2 border-dotted border-gray-300 leading-6"
            />
          )}
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { text: "" }])}
        className="text-xs font-medium ml-6"
        style={{ color: "#1877f2" }}
      >
        {addLabel}
      </button>
    </div>
  );
}