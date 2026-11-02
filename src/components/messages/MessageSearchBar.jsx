import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { NEON } from "@/lib/neonControls";
import GlassToggle from "@/components/theme/GlassToggle";

const FB = "#1877f2";

const SCOPES = [
  { id: "all", label: "All" },
  { id: "friends", label: "Friends" },
  { id: "clicks", label: "CliQs" },
  { id: "other", label: "Other" },
];

export default function MessageSearchBar({ query, setQuery, scope, setScope, filters, setFilters }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-3 pb-2">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 border rounded-lg px-3 py-2" style={NEON.field}>
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, people, CliQs…"
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <GlassToggle
          tone="ice"
          onClick={() => setOpen((o) => !o)}
          selected={open}
          aria-expanded={open}
          className="w-10 h-10 rounded-lg"
          aria-label="Filters"
        >
          <SlidersHorizontal size={18} />
        </GlassToggle>
      </div>

      {/* Scope chips */}
      <div className="flex gap-1.5 mt-2">
        {SCOPES.map((s) => (
          <GlassToggle
            key={s.id}
            tone="violet"
            selected={scope === s.id}
            onClick={() => setScope(s.id)}
            className="px-3 py-1 rounded-full text-xs font-semibold"
          >
            {s.label}
          </GlassToggle>
        ))}
      </div>

      {open && (
        <div className="mt-2 bg-white rounded-lg border p-3 space-y-2" style={{ borderColor: NEON.border }}>
          <input
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            placeholder="City"
            className="w-full text-sm border rounded-md px-2 py-1.5"
            style={NEON.field}
          />
          <input
            value={filters.job}
            onChange={(e) => setFilters({ ...filters, job: e.target.value })}
            placeholder="Job title"
            className="w-full text-sm border rounded-md px-2 py-1.5"
            style={NEON.field}
          />
          <input
            value={filters.company}
            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            placeholder="Company"
            className="w-full text-sm border rounded-md px-2 py-1.5"
            style={NEON.field}
          />
          <button onClick={() => { setFilters({ city: "", job: "", company: "" }); }} className="text-xs font-semibold" style={{ color: NEON.text }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}