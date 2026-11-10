import L from "leaflet";

/* Gatherings that share a location would draw their pins right on top of each
   other, so only the last one stayed visible. This nudges each pin into a
   free slot on screen — a small golden-angle spiral around its real spot — so
   every event in a town is its own visible, tappable marker. */
export function spreadPositions(map, events, cell = 42) {
  if (!map || !events.length) return [];
  const zoom = map.getZoom();
  const taken = new Set();

  return events.map((ev) => {
    const base = map.project([ev.latitude, ev.longitude], zoom);
    let point = base;

    for (let attempt = 0; attempt < 40; attempt++) {
      const key = `${Math.round(point.x / cell)}|${Math.round(point.y / cell)}`;
      if (!taken.has(key)) {
        taken.add(key);
        break;
      }
      const angle = attempt * 2.399963;
      const radius = cell * (0.85 + 0.5 * Math.sqrt(attempt));
      point = base.add(L.point(Math.cos(angle) * radius, Math.sin(angle) * radius));
    }

    const latlng = map.unproject(point, zoom);
    return [latlng.lat, latlng.lng];
  });
}