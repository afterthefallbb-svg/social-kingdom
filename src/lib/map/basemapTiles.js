// The one basemap every map screen reads from. Esri's World Street Map serves
// real, per-location raster tiles at every zoom keyless — OpenStreetMap's public
// server and CARTO both answer app traffic with placeholder tiles, which is what
// left whole patches of the map blank. Attribution is required and shipped by
// KingdomMapTiles. Note Esri's tile order is z/y/x, not z/x/y.
// Dark mode re-tones these same tiles in map-surface.css rather than adding a
// second provider that could fail and leave gaps.
const BASEMAP_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';

export const BASEMAP_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> · ' +
  'Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';

export function basemapTiles() {
  return { url: BASEMAP_URL, maxNativeZoom: 19, maxZoom: 19 };
}