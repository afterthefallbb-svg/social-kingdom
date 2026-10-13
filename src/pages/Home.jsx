import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MapView from "@/components/MapView";
import CategoryFilter from "@/components/CategoryFilter";
import EventSideList from "@/components/EventSideList";

const CENTER = { lat: 46.0646, lng: -118.3425 };

function haversineKm(lat, lng) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat - CENTER.lat);
  const dLng = toRad(lng - CENTER.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(CENTER.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(0);
  const [activeCat, setActiveCat] = useState(null);
  const [query, setQuery] = useState("");
  const mode = "events";

  useEffect(() => {
    const publicQuery = { visibility: { $ne: "personal" } };
    base44.entities.Event.count(publicQuery).then(setCount).catch(() => setCount(0));
    base44.entities.Event
      .filter(publicQuery, { sort: "-created_date", limit: 100 })
      .then((page) => setEvents(page.items))
      .catch(() => setEvents([]));
  }, []);

  const filtered = useMemo(() => {
    let list = events;
    if (activeCat) list = list.filter((e) => e.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => haversineKm(a.latitude, a.longitude) - haversineKm(b.latitude, b.longitude));
  }, [events, activeCat, query]);

  const goEvent = (ev) => navigate(`/event/${ev.id}`);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#aadaff]">
      <MapView
        events={mode === "events" ? filtered : []}
        activeId={null}
        onSelect={goEvent}
        mode={mode}
      />

      {/* Top stack: search + count + filters */}
      <div className="absolute top-0 left-0 right-0 z-[500] px-3 pt-3">
        <div className="flex items-center bg-white rounded-full px-4 py-2.5 shadow-lg">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "events" ? "Search Gatherings" : "Search places"}
            className="ml-2 bg-transparent outline-none flex-1 text-sm text-gray-800 placeholder:text-gray-400"
          />
        </div>

        <div
          className="px-1 mt-2 text-sm font-medium"
          style={{ color: "#111", textShadow: "0 1px 4px rgba(255,255,255,0.9)" }}
        >
          {mode === "events" ? (
            <>
              <span className="font-bold underline decoration-2 underline-offset-2">{count}</span> Gatherings in your area
            </>
          ) : (
            <span className="font-semibold">Businesses nearby</span>
          )}
        </div>

        {mode === "events" && (
          <div className="mt-1">
            <CategoryFilter active={activeCat} onSelect={setActiveCat} />
          </div>
        )}

      </div>

      {mode === "events" && (
        <EventSideList events={filtered} activeId={null} onSelect={goEvent} />
      )}
    </div>
  );
}