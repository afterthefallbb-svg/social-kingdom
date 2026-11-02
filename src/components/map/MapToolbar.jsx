import React from "react";
import { Search } from "lucide-react";
import MapCategoryBar from "@/components/map/MapCategoryBar";

export default function MapToolbar({ query, onQueryChange, activeCategory, onCategorySelect }) {
  return (
    <div className="sk-map-toolbar">
      <div className="sk-map-search" role="search">
        <Search aria-hidden="true" />
        <input
          type="search"
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