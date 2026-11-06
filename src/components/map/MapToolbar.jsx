import React from "react";
import { Search } from "lucide-react";
import MapCategoryBar from "@/components/map/MapCategoryBar";

export default function MapToolbar({ query, onQueryChange, activeCategory, onCategorySelect }) {
  return (
    <div className="sk-map-toolbar">
      <div className="sk-map-search" role="search">
        <Search aria-hidden="true" />
        {/* Opt out of the shared dark form-field surface inside this pill. */}
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
      </div>
      <MapCategoryBar active={activeCategory} onSelect={onCategorySelect} />
    </div>
  );
}