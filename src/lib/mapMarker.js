import L from "leaflet";
import { getCategory } from "./categories";

// Community sales read as a classic white sign with red "LOCAL SALE" lettering,
// so a yard sale is unmistakable next to the other category graphics.
const SALE_SIGN = `
  <svg class="sk-pin-svg" viewBox="0 0 40 40" aria-hidden="true">
    <rect x="18.4" y="23" width="3.2" height="15" rx="1.4" fill="#8f939b" />
    <rect x="2.5" y="4.5" width="35" height="21" rx="2.8" fill="#ffffff" stroke="#d92b2b" stroke-width="2.4" />
    <text x="20" y="14.4" text-anchor="middle" fill="#d92b2b"
      font-family="Helvetica, Arial, sans-serif" font-size="7.4" font-weight="700" letter-spacing="0.1">LOCAL</text>
    <text x="20" y="23" text-anchor="middle" fill="#d92b2b"
      font-family="Helvetica, Arial, sans-serif" font-size="7.4" font-weight="700" letter-spacing="0.1">SALE</text>
  </svg>`;

// Bare category graphic on the map, floating above the ground on its own shadow
// with no box, circle or backdrop behind it.
export function makeEventIcon(categoryId, active = false) {
  const cat = getCategory(categoryId);
  const size = active ? 46 : 38;
  let art;
  if (categoryId === "local_sale") {
    art = SALE_SIGN;
  } else {
    // A category shown with two glyphs (barbecue) is set smaller so the pair
    // fits inside the marker instead of spilling over its neighbours.
    const glyphs = [...(cat.emoji || "")].filter((ch) => ch !== "\uFE0F").length;
    const fontSize = Math.round(size * (glyphs > 1 ? 0.42 : 0.8));
    art = `<span class="sk-pin-emoji" style="font-size:${fontSize}px">${cat.emoji}</span>`;
  }
  const html = `<div class="sk-pin${active ? " sk-pin-active" : ""}">${art}</div>`;
  return L.divIcon({
    html,
    className: "sk-pin-wrap",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}