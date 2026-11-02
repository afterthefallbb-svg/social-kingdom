import React, { useState } from "react";
import { Search, Check, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import BioChips from "@/components/profile/BioChips";
import "@/components/profile/bio-fields.css";

/* Scrollable, searchable database of bio options plus the selected chips. */
export default function BioOptionsPicker({ label, options = [], value = [], onChange }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  const exact = options.some((o) => o.toLowerCase() === q) || value.some((v) => v.toLowerCase() === q);

  function toggle(opt) {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="px-4 pt-3">
          <BioChips items={value} onRemove={toggle} />
        </div>
      )}

      <div className="px-4 pt-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}`}
            className="pl-9"
            autoFocus
          />
        </div>
      </div>

      <div className="bio-opt-list px-4 py-3">
        {filtered.map((opt) => {
          const on = value.includes(opt);
          return (
            <button key={opt} type="button" className="bio-opt" data-on={on} onClick={() => toggle(opt)}>
              {opt}
              {on && <Check size={12} />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 py-2">
            {options.length === 0 ? "No suggestions for this category." : "No matches. Add your own below."}
          </p>
        )}
        {q && !exact && (
          <button
            type="button"
            className="bio-opt"
            style={{ borderStyle: "dashed", borderColor: "#8aa4c8" }}
            onClick={() => {
              toggle(query.trim());
              setQuery("");
            }}
          >
            <Plus size={12} />
            Add "{query.trim()}"
          </button>
        )}
      </div>
    </div>
  );
}