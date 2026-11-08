import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import MapCategoryBar from "@/components/map/MapCategoryBar";

/* Same search pill as the hub, wired to the map's own event filter. */
export default function MapToolbar({ query, onQueryChange, activeCategory, onCategorySelect }) {
  return (
    <div className="sk-map-toolbar">
      <div className="sk-map-search" role="search">
        <Search aria-hidden="true" />
        <input
          className="sk-map-search-input bg-transparent"
          type="text"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search Events..."
          aria-label="Search events"
        />
        <SlidersHorizontal aria-hidden="true" />
      </div>
      <MapCategoryBar active={activeCategory} onSelect={onCategorySelect} />
    </div>
  );
}