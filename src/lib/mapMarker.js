import L from "leaflet";
import { getCategory } from "./categories";

// Bare category graphic on the map, floating above the ground on its own shadow
// with no box, circle or backdrop behind it.
export function makeEventIcon(categoryId, active = false) {
  const cat = getCategory(categoryId);
  const size = active ? 46 : 38;
  const html = `
    <div class="sk-pin${active ? " sk-pin-active" : ""}" style="font-size:${Math.round(size * 0.8)}px;"><span class="sk-pin-emoji">${cat.emoji}</span></div>`;
  return L.divIcon({
    html,
    className: "sk-pin-wrap",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}