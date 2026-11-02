// ArcGIS World_Basemap_v2 uses _symbol, not Mapbox's road class field.
// Verified against the provider's resources/styles/root.json:
// 0 motorway; 1 highway; 2 highway ramp; 3 major arterial; 4 arterial ramp;
// 5 minor arterial; 6 minor arterial ramp; 7 local; 8 service; 10 track.
const ARCGIS_CLASSES = {
  0: 'motorway', 1: 'trunk', 2: 'trunk', 3: 'primary', 4: 'primary',
  5: 'secondary', 6: 'tertiary', 7: 'street', 8: 'service', 10: 'minor',
};
// Accent only through-roads; local streets keep the standard basemap styling.
const ROAD_GROUPS = {
  motorway: 'major', trunk: 'major',
  primary: 'arterial', secondary: 'arterial',
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
export function roadAccentPasses(zoom, palette) {
  return [
    { group: 'arterial', color: palette.roadArterial, width: interpolate(zoom, [[10, 0.7], [15, 1.6], [19, 2.4]]), opacity: 0.5 },
    { group: 'major', color: palette.roadMajor, width: interpolate(zoom, [[10, 1.2], [15, 2.8], [19, 4]]), opacity: 0.65 },
  ];
}