import React from "react";
import LinedText from "@/components/planner/LinedText";

// Centered "Notes" heading with numbered, expanding rectangular note boxes.
export default function NotesSection({ notes, onChange }) {
  const set = (i, v) => onChange(notes.map((n, idx) => (idx === i ? v : n)));
  return (
    <div className="mt-8">
      <h3 className="text-center font-bold text-gray-900 mb-3">Notes</h3>
      <div className="space-y-2">
        {notes.map((n, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-gray-300 px-3 py-1">
          <span className="text-base font-semibold text-gray-700 leading-7">{i + 1}</span>
          <LinedText value={n} onChange={(v) => set(i, v)} className="border-b-0" />
          </div>
          ))}
          </div>
          <div className="text-center mt-2">
          <button onClick={() => onChange([...notes, ""])} className="text-sm font-medium" style={{ color: "#1877f2" }}>
          add note
        </button>
      </div>
    </div>
  );
}