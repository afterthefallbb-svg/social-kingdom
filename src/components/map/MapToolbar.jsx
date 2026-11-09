import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import MapCategoryBar from "@/components/map/MapCategoryBar";

/* Same search pill as the hub, wired to the map's own event filter. Typing a
   city or zip code and pressing Enter moves the map there. */
export default function MapToolbar({
  query,
  onQueryChange,
  onSearchKey,
  searching,
  notice,
  activeCategory,
  onCategorySelect,
}) {
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
          onKeyDown={onSearchKey}
          placeholder={searching ? "Finding that place…" : "Search events or a city"}
          aria-label="Search events or a city"
        />
        <SlidersHorizontal aria-hidden="true" />
      </div>
      {notice && <p className="sk-map-notice">{notice}</p>}
      <MapCategoryBar active={activeCategory} onSelect={onCategorySelect} />
    </div>
  );
}