import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocateFixed, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MapView from "@/components/MapView";
import MapHeader from "@/components/map/MapHeader";
import MapCategoryBar from "@/components/map/MapCategoryBar";
import EventPanel from "@/components/map/EventPanel";
import { Image } from "@/components/ui/image";
import { getUserLocation } from "@/lib/localSeed";
import "@/components/map/map-kingdom.css";

const DEFAULT_CENTER = [46.0646, -118.3425];

const kmBetween = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(0);
  const [activeCat, setActiveCat] = useState(null);
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [seedTick, setSeedTick] = useState(0);
  const [locating, setLocating] = useState(false);
  const mode = "events";

  useEffect(() => {
    getUserLocation().then((loc) => {
      if (loc) setCenter([loc.latitude, loc.longitude]);
    });
  }, []);

  useEffect(() => {
    function onSeeded() { setSeedTick((t) => t + 1); }
    window.addEventListener("sk:area_seeded", onSeeded);
    return () => window.removeEventListener("sk:area_seeded", onSeeded);
  }, []);

  useEffect(() => {
    const publicQuery = { visibility: { $ne: "personal" } };
    base44.entities.Event.count(publicQuery).then(setCount).catch(() => setCount(0));
    base44.entities.Event
      .filter(publicQuery, { sort: "-created_date", limit: 100 })
      .then((page) => setEvents(page.items))
      .catch(() => setEvents([]));
  }, [seedTick]);

  const filtered = useMemo(() => {
    let list = events;
    if (activeCat) list = list.filter((e) => e.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }
    return [...list]
      .map((e) => ({ ...e, distanceMi: kmBetween(center, [e.latitude, e.longitude]) * 0.621371 }))
      .sort((a, b) => a.distanceMi - b.distanceMi);
  }, [events, activeCat, query, center]);

  const goEvent = (ev) => navigate(`/event/${ev.id}`);

  function recenterMe() {
    setLocating(true);
    getUserLocation().then((loc) => {
      setLocating(false);
      if (loc) setCenter([loc.latitude, loc.longitude]);
    });
  }

  return (
    <div className="sk-map">
      <MapView
        events={mode === "events" ? filtered : []}
        activeId={null}
        onSelect={goEvent}
        mode={mode}
        center={center}
      />

      <div className="sk-map-haze" aria-hidden="true" />
      <Image
        src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/180731d3b_kingdom-precise-lightning-original-visible.png"
        alt=""
        aria-hidden="true"
        className="sk-map-lightning"
      />

      <MapHeader />
      <MapCategoryBar active={activeCat} onSelect={setActiveCat} />

      <div className="sk-map-search">
        <Search />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === "events" ? "Search Events..." : "Search places"}
          aria-label="Search events"
        />
      </div>

      <button
        onClick={recenterMe}
        aria-label="Center on my location"
        className="sk-map-locate"
      >
        <LocateFixed className={locating ? "animate-pulse" : undefined} />
      </button>

      <EventPanel
        events={filtered}
        count={activeCat || query ? filtered.length : count}
        onSelect={goEvent}
      />
    </div>
  );
}