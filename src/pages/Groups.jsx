import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, Plus, X } from "lucide-react";
import { GROUP_CATEGORIES } from "@/lib/groupCategories";
import { NEON } from "@/lib/neonControls";

const FB = "#1877f2";

export default function Groups() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openCat, setOpenCat] = useState(null);
  const [subQuery, setSubQuery] = useState("");

  const filtered = GROUP_CATEGORIES.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const subs = openCat
    ? openCat.subs.filter((s) => s.toLowerCase().includes(subQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Groups</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      {/* Search */}
      <div className="px-4 mt-4">
        <div className="flex items-center bg-gray-100 rounded-full px-3 h-11">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories"
            className="ml-2 bg-transparent outline-none text-sm flex-1"
          />
        </div>

        {/* Create Group — blue bubble, white text + white plus */}
        <button
          onClick={() => navigate("/create-group")}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white"
          style={{ background: FB }}
        >
          <Plus size={20} strokeWidth={2.5} />
          Create Group
        </button>
      </div>

      {/* Category bubbles (rectangular) with arrow */}
      <div className="px-4 mt-5 grid grid-cols-2 gap-3">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setOpenCat(c);
              setSubQuery("");
            }}
            className="flex items-center justify-between rounded-xl border px-3 py-3.5 text-left"
            style={{
              background: NEON.chip.background,
              borderColor: NEON.chip.borderColor,
              color: NEON.chip.color,
              boxShadow: NEON.chip.boxShadow,
            }}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{c.emoji}</span>
              <span className="text-sm font-semibold truncate" style={{ textShadow: "0 1px 3px rgba(0,20,60,0.65)" }}>{c.label}</span>
            </span>
            <ChevronRight size={18} className="shrink-0" style={{ color: "#ffffff" }} />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-sm text-gray-400 text-center py-4">No categories match.</p>
        )}
      </div>

      {/* Subcategory sheet */}
      {openCat && (
        <div className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-black/40" onClick={() => setOpenCat(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-xl">{openCat.emoji}</span> {openCat.label}
              </h3>
              <button onClick={() => setOpenCat(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="p-3 border-b">
              <div className="flex items-center bg-gray-100 rounded-full px-3 h-10">
                <Search size={15} className="text-gray-400 shrink-0" />
                <input
                  value={subQuery}
                  onChange={(e) => setSubQuery(e.target.value)}
                  placeholder="Search subcategories"
                  className="ml-2 bg-transparent outline-none text-sm flex-1"
                />
              </div>
            </div>
            <div className="overflow-y-auto p-2">
              {subs.map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/groups/${openCat.id}?sub=${encodeURIComponent(s)}`)}
                  className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-[#e6f2ff] text-left"
                >
                  <span className="text-sm font-medium" style={{ color: NEON.text }}>{s}</span>
                  <ChevronRight size={16} style={{ color: NEON.solid }} />
                </button>
              ))}
              {subs.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No subcategories match.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}