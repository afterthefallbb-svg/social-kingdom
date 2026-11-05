import L from "leaflet";
import { getCategory } from "./categories";
import { pinGlyphMarkup } from "./mapPinGlyphs";

/* Pins are built as layered vector markers: an extruded champagne-gold body, a
   pressed enamel face carrying the category glyph in white line art, specular
   highlights along the lit shoulder and a soft contact shadow beneath the tip.
   Vector keeps every edge crisp on any screen density. */

let uid = 0;

const BODY = "M20 52.4C15.2 38.6 5.4 29.6 5.4 18.2a14.6 14.6 0 1 1 29.2 0C34.6 29.6 24.8 38.6 20 52.4Z";

function pinSvg(cat, width, height) {
  const id = `skpin${uid++}`;
  const glyph = pinGlyphMarkup(cat.id);
  const enamel = cat.color || "#3b82f6";

  return `<svg viewBox="0 0 40 56" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="sk-pin-svg" shape-rendering="geometricPrecision">
  <defs>
    <linearGradient id="${id}-metal" x1="7" y1="3" x2="31" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFCF0"/>
      <stop offset=".18" stop-color="#FFE7AE"/>
      <stop offset=".42" stop-color="#F2C468"/>
      <stop offset=".66" stop-color="#C69433"/>
      <stop offset=".86" stop-color="#8E6417"/>
      <stop offset="1" stop-color="#5E3F0C"/>
    </linearGradient>
    <linearGradient id="${id}-deep" x1="7" y1="4" x2="31" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#A97523"/>
      <stop offset=".5" stop-color="#6B4710"/>
      <stop offset="1" stop-color="#3A2606"/>
    </linearGradient>
    <linearGradient id="${id}-rim" x1="5" y1="10" x2="35" y2="27" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFDF4"/>
      <stop offset=".38" stop-color="#F7D98F"/>
      <stop offset=".72" stop-color="#B0801F"/>
      <stop offset="1" stop-color="#6A470E"/>
    </linearGradient>
    <radialGradient id="${id}-shade" cx=".32" cy=".26" r=".92">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".55"/>
      <stop offset=".42" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset=".78" stop-color="#000000" stop-opacity=".18"/>
      <stop offset="1" stop-color="#000000" stop-opacity=".52"/>
    </radialGradient>
    <filter id="${id}-soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>
    <filter id="${id}-contact" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="2.1"/>
    </filter>
    <filter id="${id}-glyph" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy=".55" stdDeviation=".35" flood-color="#000000" flood-opacity=".45"/>
    </filter>
  </defs>
  <ellipse cx="21.4" cy="52.6" rx="8.6" ry="2.7" fill="#050B24" opacity=".34" filter="url(#${id}-contact)"/>
  <path d="${BODY}" transform="translate(1.15 2.6)" fill="url(#${id}-deep)"/>
  <path d="${BODY}" fill="url(#${id}-metal)" stroke="url(#${id}-rim)" stroke-width=".75"/>
  <path d="M8.2 16.6a12.1 12.1 0 0 1 14.4-10.7" fill="none" stroke="#FFFEF7" stroke-opacity=".9" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M30.6 21.4a12.1 12.1 0 0 1-7.2 8.4" fill="none" stroke="#4A3108" stroke-opacity=".45" stroke-width="1.1" stroke-linecap="round"/>
  <circle cx="20" cy="18.2" r="10.7" fill="${enamel}"/>
  <circle cx="20" cy="18.2" r="10.7" fill="url(#${id}-shade)"/>
  <circle cx="20" cy="18.2" r="10.7" fill="none" stroke="#3A2606" stroke-opacity=".38" stroke-width=".7"/>
  <circle cx="20" cy="18.2" r="11.15" fill="none" stroke="url(#${id}-rim)" stroke-width=".8"/>
  <ellipse cx="16.1" cy="13.6" rx="4.4" ry="2.5" transform="rotate(-32 16.1 13.6)" fill="#ffffff" opacity=".3" filter="url(#${id}-soft)"/>
  <g transform="translate(12.5 10.7) scale(.625)" fill="none" stroke="#FFFFFF" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" filter="url(#${id}-glyph)">${glyph}</g>
</svg>`;
}

export function makeEventIcon(categoryId, active = false) {
  const cat = getCategory(categoryId);
  const width = active ? 50 : 40;
  const height = Math.round(width * 1.4);
  const html = `<div class="sk-pin${active ? " sk-pin-active" : ""}"><span class="sk-pin-glyph">${pinSvg(
    cat,
    width,
    height
  )}</span></div>`;
  return L.divIcon({
    html,
    className: "sk-pin-wrap",
    iconSize: [width, height],
    iconAnchor: [width / 2, height - 3],
    popupAnchor: [0, -height + 6],
  });
}