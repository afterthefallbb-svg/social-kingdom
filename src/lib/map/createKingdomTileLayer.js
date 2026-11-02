import L from 'leaflet';
import { loadGeographicTile } from '@/lib/map/vectorSource';
import { paintGeography } from '@/lib/map/paintGeography';

export default function createKingdomTileLayer(palette, roadsOnly, isActive) {
  const unloaded = new WeakSet();
  // Render at the visible zoom so road widths do not balloon above source zoom 16.
  const layer = L.gridLayer({ tileSize: 256, maxZoom: 19,
    zIndex: roadsOnly ? 3 : 1, className: roadsOnly ? 'sk-road-tiles' : 'sk-vector-tiles',
    keepBuffer: 2, updateWhenIdle: true });
  layer.createTile = (coords, done) => {
    const tile = document.createElement('canvas');
    tile.width = 256; tile.height = 256; tile.setAttribute('aria-hidden', 'true');
    loadGeographicTile(coords).then((source) => {
      if (!isActive() || unloaded.has(tile)) return;
      paintGeography(tile, source, coords, palette, roadsOnly);
      done(null, tile);
    }).catch((error) => { if (isActive() && !unloaded.has(tile)) done(error, tile); });
    return tile;
  };
  layer.on('tileunload', ({ tile }) => unloaded.add(tile));
  return layer;
}