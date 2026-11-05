import L from "leaflet";
import { pinArtSvg } from "./mapPinArt";

/* Each event is marked by a small three dimensional illustration of the thing
   itself — a car for automotive, a football for sports, a martini glass for
   drinks — sitting on the map with its own contact shadow. No pin body, disc,
   cone or outline wraps the artwork: the object is the marker. */

export function makeEventIcon(categoryId, active = false) {
  const width = active ? 58 : 48;
  const height = width;
  const html = `<div class="sk-pin${active ? " sk-pin-active" : ""}"><span class="sk-pin-glyph">${pinArtSvg(
    categoryId,
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