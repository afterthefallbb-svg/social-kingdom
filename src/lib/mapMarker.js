import L from "leaflet";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getCategory } from "./categories";
import { pinGlyphFor } from "./mapPinGlyphs";

// Bare category graphic on the map, floating above the ground on its own shadow
// with no box, circle or backdrop behind it. The glyph is a vector icon in the
// category's own color with a light halo, so it stays sharp and legible.
export function makeEventIcon(categoryId, active = false) {
  const cat = getCategory(categoryId);
  const size = active ? 46 : 38;
  const Glyph = pinGlyphFor(cat.id);
  const svg = renderToStaticMarkup(
    React.createElement(Glyph, {
      size: Math.round(size * 0.66),
      strokeWidth: 2.35,
      fill: "none",
      fillOpacity: 0,
      color: cat.color,
      "aria-hidden": true,
    })
  );
  const html = `
    <div class="sk-pin${active ? " sk-pin-active" : ""}"><span class="sk-pin-glyph">${svg}</span></div>`;
  return L.divIcon({
    html,
    className: "sk-pin-wrap",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}