import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, SlidersHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/sk-image";
import { coverPhoto } from "@/lib/coverPhotos";
import { MARKETPLACE_CATEGORIES, getMarketplaceCategory } from "@/lib/marketplaceCategories";

const FB = "#1877f2";

const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" }
];

export default function BuySell() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(null);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const query = {};
        if (category) query.category = category;
        if (search.trim()) query.title = { $regex: search.trim(), $options: "i" };
        const opts = { limit: 100 };
        if (sort === "newest") opts.sort = "-created_date";
        if (sort === "price_asc") opts.sort = "price";
        if (sort === "price_desc") opts.sort = "-price";
        const res = await base44.entities.Listing.filter(query, opts);
        if (active) setListings(res.items);
      } catch {
        if (active) setListings([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [category, sort, search]);

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Buy / Sell</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      {/* Search + filter */}
      <div className="flex items-center gap-2 px-4 mt-4">
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 h-11">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items"
            className="ml-2 bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ background: showFilters ? FB : "#eef2f7", color: showFilters ? "#fff" : "#1f2937" }}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {showFilters && (
        <div className="px-4 mt-2 flex gap-2 overflow-x-auto no-scrollbar">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                background: s.id === sort ? FB : "#eef2f7",
                color: s.id === sort ? "#fff" : "#1f2937"
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Category chips — most popular first */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCategory(null)}
          className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium"
          style={{ background: !category ? FB : "#eef2f7", color: !category ? "#fff" : "#1f2937" }}
        >
          All
        </button>
        {MARKETPLACE_CATEGORIES.map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(active ? null : c.id)}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium"
              style={{ background: active ? FB : "#eef2f7", color: active ? "#fff" : "#1f2937" }}
            >
              <span className="mr-1">{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Buy / Sell actions */}
      <div className="flex gap-3 px-4 mt-4">
        <button
          onClick={() => setCategory(null)}
          className="flex-1 h-11 rounded-xl font-semibold text-white"
          style={{ background: FB }}
        >
          Buy
        </button>
        <button
          onClick={() => navigate("/sell")}
          className="flex-1 h-11 rounded-xl font-semibold text-gray-800 bg-gray-100"
        >
          Sell
        </button>
      </div>

      {/* Listings grid */}
      <div className="px-4 mt-5">
        {loading ? (
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        ) : listings.length === 0 ? (
          <p className="text-sm text-gray-400">No items in your area yet. Tap Sell to post one.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((l) => {
              const cat = getMarketplaceCategory(l.category);
              return (
                <button
                  key={l.id}
                  onClick={() => navigate(`/listing/${l.id}`)}
                  className="text-left rounded-xl border border-gray-200 overflow-hidden bg-white"
                >
                  <span className="block w-full aspect-square overflow-hidden bg-gray-100 flex items-center justify-center text-3xl">
                    {l.image_url ? (
                      <Image src={l.image_url} fallback={coverPhoto(l.id, l.category)} fittingType="fill" className="w-full h-full" />
                    ) : (
                      cat.emoji
                    )}
                  </span>
                  <div className="p-2">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      ${Number(l.price || 0).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-600 truncate">{l.title}</div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5">{l.description}</div>
                    <div className="text-[10px] mt-1" style={{ color: FB }}>
                      {cat.emoji} {cat.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}