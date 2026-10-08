import L from "leaflet";
import { getCategory } from "./categories";

// Renders the category emoji as a floating graphic on the map point —
// no teardrop pin or circle around it, just the icon with a soft shadow.
export function makeEventIcon(categoryId, active = false) {
  const cat = getCategory(categoryId);
  const scale = active ? 1.25 : 1;
  const size = 34 * scale;
  const html = `
    <div style="position:relative; transform: translate(-50%,-100%); width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center; font-size:${26 * scale}px; line-height:1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.5)); cursor:pointer;">${cat.emoji}</div>`;
  return L.divIcon({
    html,
    className: "meetme-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size]
  });
}