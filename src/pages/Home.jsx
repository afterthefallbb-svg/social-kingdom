import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapCompass from "@/components/map/MapCompass";
import { base44 } from "@/api/base44Client";
import MapView from "@/components/MapView";
import MapTopBar from "@/components/map/MapTopBar";
import MapToolbar from "@/components/map/MapToolbar";
import LocationBanner from "@/components/map/LocationBanner";
import EventPanel from "@/components/map/EventPanel";
import ExampleEventSheet from "@/components/map/ExampleEventSheet";
import SignUpSheet from "@/components/auth/SignUpSheet";
import useGuest from "@/hooks/useGuest";
import { EXAMPLE_CITY, exampleEvents, exampleEventsAround } from "@/lib/exampleEvents";
import { getUserLocation, seedLocalEventsForUser } from "@/lib/localSeed";
import { geocodeCity } from "@/lib/geocodeCity";
import "@/components/map/map-kingdom.css";
import "@/components/map/map-surface.css";

const DEFAULT_CENTER = [46.0646, -118.3425];
const LOCATION_ASKED = "sk:location_prompt";

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
  const [denied, setDenied] = useState(false);
  const [banner, setBanner] = useState(() => localStorage.getItem(LOCATION_ASKED) !== "done");
  const [notice, setNotice] = useState("");
  const [searching, setSearching] = useState(false);
  const [example, setExample] = useState(null);
  const [signUp, setSignUp] = useState(null);
  const mode = "events";
  const { checking, guest } = useGuest();

  useEffect(() => {
    function onSeeded() { setSeedTick((t) => t + 1); }
    window.addEventListener("sk:area_seeded", onSeeded);
    return () => window.removeEventListener("sk:area_seeded", onSeeded);
  }, []);

  /* Gatherings are loaded for the area on screen, so the town someone opens the
     map in already has its own events — wherever that is in the country. */
  useEffect(() => {
    if (checking || guest) return;
    const REACH = located ? 1.1 : 8; // a tight box once they pick a place, a regional one before that
    const areaQuery = {
      visibility: { $ne: "personal" },
      latitude: { $gte: center[0] - REACH, $lte: center[0] + REACH },
      longitude: { $gte: center[1] - REACH, $lte: center[1] + REACH },
    };
    base44.entities.Event.count(areaQuery).then(setCount).catch(() => setCount(0));
    base44.entities.Event
      .filter(areaQuery, { sort: "-created_date", limit: 200 })
      .then((page) => setEvents(page.items))
      .catch(() => setEvents([]));
  }, [seedTick, checking, guest, center[0], center[1], located]);

  /* Nobody's area is requested until they ask for it: five local gatherings,
     centered on their own spot once they share it. */
  const examples = useMemo(() => {
    if (!located) return exampleEvents();
    return exampleEventsAround(center[0], center[1])
      .map((e) => ({
        ...e,
        distanceMi: kmBetween(center, [e.latitude, e.longitude]) * 0.621371,
      }))
      .sort((a, b) => a.distanceMi - b.distanceMi)
      .slice(0, 5);
  }, [located, center]);

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

  const hideBanner = () => {
    localStorage.setItem(LOCATION_ASKED, "done");
    setBanner(false);
  };

  /* A member's own area is filled with five gatherings the moment they share
     their location — never before. */
  const fillArea = () => {
    localStorage.setItem("sk:location_granted", "1");
    if (guest) return;
    seedLocalEventsForUser().then((res) => {
      if (res?.seeded) window.dispatchEvent(new CustomEvent("sk:area_seeded"));
    });
  };

  function enableLocation() {
    setLocating(true);
    getUserLocation().then((loc) => {
      setLocating(false);
      if (!loc) {
        setDenied(true);
        return;
      }
      hideBanner();
      fillArea();
      setDenied(false);
      setCenter([loc.latitude, loc.longitude]);
      setZoom(14);
      setLocated(true);
    });
  }

  /* A city or zip code typed into the search bar moves the map there and fills
     it with that area's gatherings — the fallback when location is off. */
  async function onSearchKey(event) {
    if (event.key !== "Enter") return;
    const q = query.trim();
    if (q.length < 2) return;
    event.preventDefault();
    setSearching(true);
    const place = await geocodeCity(q);
    setSearching(false);
    if (!place) {
      setNotice(`No place found for “${q}”`);
      return;
    }
    setNotice(`Showing events near ${place.label}`);
    setCenter([place.lat, place.lng]);
    setZoom(13);
    setLocated(true);
    setQuery("");
    hideBanner();
  }

  /* Compass: jump to the user's own spot, zoomed in close enough to see
     themselves in the city and the events around them. */
  function recenterMe() {
    setLocating(true);
    getUserLocation().then((loc) => {
      setLocating(false);
      if (loc) {
        hideBanner();
        fillArea();
        setCenter([loc.latitude, loc.longitude]);
        setLocated(true);
        setDenied(false);
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

      <MapTopBar />

      <MapToolbar
        query={query}
        onQueryChange={setQuery}
        onSearchKey={onSearchKey}
        searching={searching}
        notice={notice}
        activeCategory={activeCat}
        onCategorySelect={setActiveCat}
      />

      {banner && (
        <LocationBanner
          denied={denied}
          locating={locating}
          onEnable={enableLocation}
          onDismiss={hideBanner}
        />
      )}

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
          onSignUp={() => setSignUp("Sign up to join this gathering")}
        />
      )}

      <SignUpSheet open={!!signUp} intent={signUp} onClose={() => setSignUp(null)} />
    </div>
  );
}