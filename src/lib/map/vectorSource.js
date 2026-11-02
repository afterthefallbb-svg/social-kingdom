import { decodeVectorTile } from '@/lib/map/vectorTile';

// Same ArcGIS provider and real-world geography, now with separately styled features.
const SOURCE = 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer';
const tiles = new Map();
function load(z, x, y) {
  const key = `${z}/${y}/${x}`;
  if (tiles.has(key)) return tiles.get(key);
  const promise = fetch(`${SOURCE}/tile/${key}.pbf`).then(async (response) => {
    // ArcGIS uses an indexed pyramid: a missing child inherits its parent tile.
    if (response.status === 404 || response.status === 204) return null;
    if (!response.ok) throw new Error(`Map imagery could not load (${response.status})`);
    return decodeVectorTile(await response.arrayBuffer());
  }).catch((error) => { tiles.delete(key); throw error; });
  tiles.set(key, promise);
  if (tiles.size > 96) tiles.delete(tiles.keys().next().value);
  return promise;
}
export async function loadGeographicTile(coords) {
  // Keep the existing source detail limit while painting styles at the real map zoom.
  let z = Math.min(coords.z, 16);
  const overzoom = 2 ** (coords.z - z);
  let x = Math.floor(coords.x / overzoom), y = Math.floor(coords.y / overzoom);
  while (z >= 0) {
    const layers = await load(z, x, y);
    if (layers) return { layers, z, x, y };
    z -= 1; x = Math.floor(x / 2); y = Math.floor(y / 2);
  }
  throw new Error('Geographic map tile is unavailable');
}