import L from "leaflet";
import { getCategory } from "./categories";

// Builds a custom teardrop pin with a category emoji, so each event type
// renders a distinct graphic on the map (basketball, playground, etc.).
export function makeEventIcon(categoryId, active = false) {
  const cat = getCategory(categoryId);
  const scale = active ? 1.18 : 1;
  const w = 44 * scale;
  const h = 56 * scale;
  const html = `
    <div style="position:relative; transform: translate(-50%, -100%); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
      <svg width="${w}" height="${h}" viewBox="0 0 44 56" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 0 C9.85 0 0 9.85 0 22 C0 38.5 22 56 22 56 C22 56 44 38.5 44 22 C44 9.85 34.15 0 22 0 Z" fill="${cat.color}" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="22" cy="22" r="14" fill="#ffffff"/>
      </svg>
      <div style="position:absolute; top:${4 * scale}px; left:50%; transform: translateX(-50%); width:${w}px; height:${28 * scale}px; display:flex; align-items:center; justify-content:center; font-size:${18 * scale}px; line-height:1;">${cat.emoji}</div>
    </div>`;
  return L.divIcon({
    html,
    className: "meetme-marker",
    iconSize: [w, h],
    iconAnchor: [w / 2, h]
  });
}