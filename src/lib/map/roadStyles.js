// ArcGIS World_Basemap_v2 uses _symbol, not Mapbox's road class field.
// Verified against the provider's resources/styles/root.json:
// 0 motorway; 1 highway; 2 highway ramp; 3 major arterial; 4 arterial ramp;
// 5 minor arterial; 6 minor arterial ramp; 7 local; 8 service; 10 track.
const ARCGIS_CLASSES = {
  0: 'motorway', 1: 'trunk', 2: 'trunk', 3: 'primary', 4: 'primary',
  5: 'secondary', 6: 'tertiary', 7: 'street', 8: 'service', 10: 'minor',
};
const ROAD_GROUPS = {
  motorway: 'gold', trunk: 'gold', primary: 'gold',
  secondary: 'blue', tertiary: 'blue',
  street: 'local', minor: 'local', service: 'local',
};
export function roadGroup(properties) {
  if (Number(properties.Viz) === 3) return null;
  const roadClass = properties.class ?? ARCGIS_CLASSES[properties._symbol];
  return ROAD_GROUPS[roadClass] ?? null;
}
function interpolate(zoom, stops) {
  if (zoom <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [z, value] = stops[i], [previousZoom, previousValue] = stops[i - 1];
    if (zoom <= z) return previousValue + (value - previousValue) * (zoom - previousZoom) / (z - previousZoom);
  }
  return stops[stops.length - 1][1];
}
export function luxuryRoadPasses(zoom, palette) {
  return [
    { group: 'local', color: palette.roadLocal, width: 1.1, opacity: 0.75 },
    { group: 'blue', color: palette.electric, width: 2.2, opacity: 0.9, blur: 0.5 },
    { group: 'gold', color: palette.gold, width: interpolate(zoom, [[10, 5], [15, 12], [18, 20]]), opacity: 0.22, blur: 8 },
    { group: 'gold', color: palette.gold, width: interpolate(zoom, [[10, 1.2], [15, 3], [18, 5]]), opacity: 0.95 },
    { group: 'gold', color: palette.roadHighlight, width: interpolate(zoom, [[10, 0.4], [15, 1], [18, 1.5]]), opacity: 0.95 },
  ];
}