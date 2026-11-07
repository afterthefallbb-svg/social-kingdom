import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapCompass from "@/components/map/MapCompass";
import { base44 } from "@/api/base44Client";
import MapView from "@/components/MapView";
import MapToolbar from "@/components/map/MapToolbar";
import EventPanel from "@/components/map/EventPanel";
import ExampleEventSheet from "@/components/map/ExampleEventSheet";
import useGuest from "@/hooks/useGuest";
import { EXAMPLE_CITY, exampleEvents, exampleEventsAround } from "@/lib/exampleEvents";
import { getUserLocation } from "@/lib/localSeed";
import "@/components/map/map-kingdom.css";
import "@/components/map/map-surface.css";

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
  const [zoom, setZoom] = useState(13);
  const [seedTick, setSeedTick] = useState(0);
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [example, setExample] = useState(null);
  const mode = "events";
  const { checking, guest } = useGuest();

  // Wherever someone is — signed in or not — the map asks once for their
  // location and fills their own area with gatherings at that moment.
  useEffect(() => {
    if (checking) return;
    getUserLocation().then((loc) => {
      if (!loc) return;
      setCenter([loc.latitude, loc.longitude]);
      setLocated(true);
    });
  }, [checking]);

  useEffect(() => {
    function onSeeded() { setSeedTick((t) => t + 1); }
    window.addEventListener("sk:area_seeded", onSeeded);
    return () => window.removeEventListener("sk:area_seeded", onSeeded);
  }, []);

  useEffect(() => {
    if (checking || guest) return;
    const publicQuery = { visibility: { $ne: "personal" } };
    base44.entities.Event.count(publicQuery).then(setCount).catch(() => setCount(0));
    base44.entities.Event
      .filter(publicQuery, { sort: "-created_date", limit: 100 })
      .then((page) => setEvents(page.items))
      .catch(() => setEvents([]));
  }, [seedTick, checking, guest]);

  // Once a visitor shares their location, their own area gets populated: one
  // example gathering per five square miles around them.
  const examples = useMemo(
    () => (located ? exampleEventsAround(center[0], center[1]) : exampleEvents()),
    [located, center]
  );

  const filtered = useMemo(() => {
    let list = guest ? examples : events;
    if (activeCat) list = list.filter((e) => e.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }
    return [...list]
      .map((e) => ({
        ...e,
        distanceMi: e.distanceMi ?? kmBetween(center, [e.latitude, e.longitude]) * 0.621371,
      }))
      .sort((a, b) => a.distanceMi - b.distanceMi);
  }, [events, examples, activeCat, query, center, guest]);

  const goEvent = (ev) => {
    if (guest) {
      setExample(ev);
      return;
    }
    navigate(`/event/${ev.id}`);
  };

  /* Compass: jump to the user's own spot, zoomed in close enough to see
     themselves in the city and the events around them. */
  function recenterMe() {
    setLocating(true);
    getUserLocation().then((loc) => {
      setLocating(false);
      if (loc) {
        setCenter([loc.latitude, loc.longitude]);
        setLocated(true);
        setZoom(14);
      }
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
        zoom={guest && !located ? EXAMPLE_CITY.zoom : zoom}
      />

      <MapToolbar
        query={query}
        onQueryChange={setQuery}
        activeCategory={activeCat}
        onCategorySelect={setActiveCat}
      />

      <button
        onClick={recenterMe}
        aria-label="Center on my location"
        className="sk-map-locate"
      >
        <MapCompass locating={locating} />
      </button>

      <EventPanel
        events={filtered}
        count={guest || activeCat || query ? filtered.length : count}
        onSelect={goEvent}
      />

      {example && (
        <ExampleEventSheet
          event={example}
          onClose={() => setExample(null)}
          onSignUp={() => navigate("/register")}
        />
      )}
    </div>
  );
}