import React, { useEffect } from 'react';
import L from 'leaflet';
import { TileLayer, useMap } from 'react-leaflet';
import { loadGeographicTile } from '@/lib/map/vectorSource';
import { paintGeography } from '@/lib/map/paintGeography';
import { readMapPalette } from '@/lib/map/mapPalette';

export default function KingdomMapTiles() {
  const map = useMap();
  useEffect(() => {
    let mounted = true;
    const unloaded = new WeakSet(), palette = readMapPalette(map.getContainer());
    const layer = L.gridLayer({ tileSize: 256, maxNativeZoom: 16, maxZoom: 19,
      zIndex: 1, className: 'sk-vector-tiles', keepBuffer: 2, updateWhenIdle: true });
    layer.createTile = (coords, done) => {
      const tile = document.createElement('canvas');
      tile.width = 256; tile.height = 256; tile.setAttribute('aria-hidden', 'true');
      loadGeographicTile(coords).then((source) => {
        if (!mounted || unloaded.has(tile)) return;
        paintGeography(tile, source, coords, palette); done(null, tile);
      }).catch((error) => { if (mounted && !unloaded.has(tile)) done(error, tile); });
      return tile;
    };
    layer.on('tileunload', ({ tile }) => unloaded.add(tile));
    layer.addTo(map);
    const attribution = L.control.attribution({ prefix: false }).addTo(map);
    attribution.addAttribution('<a href="https://www.arcgis.com/home/item.html?id=274684d7a9d74ca4b87f529776feb3a2" target="_blank" rel="noopener noreferrer">Esri &amp; contributors</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>');
    return () => { mounted = false; map.removeLayer(layer); map.removeControl(attribution); };
  }, [map]);
  return <TileLayer
    url="https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}"
    className="sk-terrain-tiles" zIndex={2} maxNativeZoom={16} maxZoom={19}
  />;
}