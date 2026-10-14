import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const FB = "#1877f2";

const SCOPES = [
  { id: "all", label: "All" },
  { id: "friends", label: "Friends" },
  { id: "clicks", label: "Clicks" },
  { id: "other", label: "Other" },
];

export default function MessageSearchBar({ query, setQuery, scope, setScope, filters, setFilters }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-3 pb-2">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, people, CliQs…"
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 bg-white"
          style={{ color: FB }}
          aria-label="Filters"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Scope chips */}
      <div className="flex gap-1.5 mt-2">
        {SCOPES.map((s) => (
          <button
            key={s.id}
            onClick={() => setScope(s.id)}
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={scope === s.id ? { background: FB, color: "#fff" } : { background: "#fff", color: FB, border: `1px solid ${FB}` }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {open && (
        <div className="mt-2 bg-white rounded-lg border border-gray-200 p-3 space-y-2">
          <input
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            placeholder="City"
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
          />
          <input
            value={filters.job}
            onChange={(e) => setFilters({ ...filters, job: e.target.value })}
            placeholder="Job title"
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
          />
          <input
            value={filters.company}
            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            placeholder="Company"
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
          />
          <button onClick={() => { setFilters({ city: "", job: "", company: "" }); }} className="text-xs text-gray-500">Clear filters</button>
        </div>
      )}
    </div>
  );
}