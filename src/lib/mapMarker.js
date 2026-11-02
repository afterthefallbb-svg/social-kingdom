import L from "leaflet";
import { getCategory } from "./categories";

// Gold-rimmed navy badge on the map carrying the category emoji, matching the
// hub's obsidian/sapphire/gold chrome.
export function makeEventIcon(categoryId, active = false) {
  const cat = getCategory(categoryId);
  const size = active ? 46 : 38;
  const html = `
    <div class="sk-pin${active ? " sk-pin-active" : ""}" style="font-size:${Math.round(size * 0.48)}px;"><span class="sk-pin-emoji">${cat.emoji}</span></div>`;
  return L.divIcon({
    html,
    className: "sk-pin-wrap",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}