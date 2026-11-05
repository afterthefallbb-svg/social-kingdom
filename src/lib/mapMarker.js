import L from "leaflet";
import { getCategory } from "./categories";

// Bare category graphic on the map, floating above the ground on its own shadow
// with no box, circle or backdrop behind it.

// Barbecue has no emoji of its own, so it keeps the same look with a flat square
// grill and a carry handle across the front that folds it up.
const BARBECUE_ART = `<svg viewBox="0 0 40 40" width="1em" height="1em" style="display:block" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="5" y="10.6" width="30" height="18.6" rx="4.4" fill="#4C5A66"/>
  <path d="M9.4 10.6h21.2a4.4 4.4 0 0 1 4.4 4.4v1.4H5V15a4.4 4.4 0 0 1 4.4-4.4z" fill="#6B7C87"/>
  <rect x="15.7" y="4.8" width="8.6" height="4" rx="2" fill="#B9C6CF"/>
  <rect x="11.6" y="22.1" width="16.8" height="5.2" rx="2.6" fill="#D7E1E8"/>
  <rect x="8.2" y="29.2" width="3.4" height="4.4" rx="1.4" fill="#8FA0AA"/>
  <rect x="28.4" y="29.2" width="3.4" height="4.4" rx="1.4" fill="#8FA0AA"/>
</svg>`;

export function makeEventIcon(categoryId, active = false) {
  const cat = getCategory(categoryId);
  const size = active ? 46 : 38;
  const art = categoryId === "barbecue" ? BARBECUE_ART : cat.emoji;
  const html = `
    <div class="sk-pin${active ? " sk-pin-active" : ""}" style="font-size:${Math.round(size * 0.8)}px;"><span class="sk-pin-emoji">${art}</span></div>`;
  return L.divIcon({
    html,
    className: "sk-pin-wrap",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}