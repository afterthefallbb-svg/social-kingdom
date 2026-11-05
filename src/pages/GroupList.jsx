import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Plus, SlidersHorizontal, Users, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/groupCategories";
import { Image } from "@/components/ui/sk-image";
import { coverPhoto } from "@/lib/coverPhotos";

const FB = "#1877f2";

export default function GroupList() {
  const { category } = useParams();
  const [params] = useSearchParams();
  const sub = params.get("sub") || "";
  const navigate = useNavigate();

  const cat = getCategory(category);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular"); // popular | recent
  const [locFilter, setLocFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const query_ = { category };
      if (sub) query_.subcategory = sub;
      const res = await base44.entities.Group
        .filter(query_, { sort: sort === "recent" ? "-created_date" : "-member_count", limit: 100 })
        .catch(() => ({ items: [] }));
      if (active) {
        setGroups(res.items);
        setLoading(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sub, sort]);

  const visible = groups.filter((g) => {
    const matchQ = !query || (g.name || "").toLowerCase().includes(query.toLowerCase());
    const matchLoc = !locFilter || (g.location || "").toLowerCase().includes(locFilter.toLowerCase());
    return matchQ && matchLoc;
  });

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/groups")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <div className="min-w-0">
          <span className="font-bold text-gray-900 text-lg truncate block">{cat.emoji} {cat.label}</span>
          {sub && <span className="text-xs text-gray-400 truncate block">{sub}</span>}
        </div>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      {/* Search + filter */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-full px-3 h-11 flex-1">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groups"
              className="ml-2 bg-transparent outline-none text-sm flex-1"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="h-11 w-11 rounded-full flex items-center justify-center border border-gray-200"
            style={showFilters ? { background: FB, color: "#fff", borderColor: FB } : { color: "#374151" }}
            aria-label="Filters"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <button
          onClick={() => navigate(`/create-group?category=${category}${sub ? `&sub=${encodeURIComponent(sub)}` : ""}`)}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white"
          style={{ background: FB }}
        >
          <Plus size={20} strokeWidth={2.5} />
          Create Group
        </button>

        {showFilters && (
          <div className="mt-3 p-3 rounded-xl border border-gray-200 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Sort</label>
              <div className="flex gap-2 mt-1.5">
                {[{ id: "popular", l: "Popular" }, { id: "recent", l: "Recent" }].map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSort(o.id)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={sort === o.id ? { background: FB, color: "#fff" } : { background: "#eef2f7", color: "#1f2937" }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Location</label>
              <input
                value={locFilter}
                onChange={(e) => setLocFilter(e.target.value)}
                placeholder="City or state"
                className="mt-1.5 w-full h-9 rounded-md border border-input px-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Group list */}
      <div className="px-4 mt-4 space-y-3">
        {loading && <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />}
        {!loading && visible.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No groups here yet — be the first to create one!</p>
        )}
        {visible.map((g) => (
          <div key={g.id} className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-28 w-full relative" style={{ background: `linear-gradient(135deg, ${cat.color}, #1f2937)` }}>
              {g.header_image && (
                <Image src={g.header_image} fallback={coverPhoto(g.id, g.category)} fittingType="fill" className="w-full h-full" />
              )}
            </div>
            <div className="p-3 flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{g.name}</p>
                {g.description && <p className="text-xs text-gray-500 line-clamp-2">{g.description}</p>}
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1"><Users size={12} /> {g.member_count || 0}</span>
                  {g.location && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {g.location}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}