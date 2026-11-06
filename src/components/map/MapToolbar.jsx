import React from "react";
import { Search } from "lucide-react";
import MapCategoryBar from "@/components/map/MapCategoryBar";

export default function MapToolbar({ query, onQueryChange, activeCategory, onCategorySelect }) {
  return (
    <div className="sk-map-toolbar">
      <div className="sk-map-search" role="search">
        <Search aria-hidden="true" />
        {/* A plain text field: the browser's own search widget paints a dark
            box inside the white pill, so the field is drawn entirely by CSS. */}
        <input
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