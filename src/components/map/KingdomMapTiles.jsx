import React, { useEffect } from 'react';
import L from 'leaflet';
import { TileLayer, useMap } from 'react-leaflet';
import createKingdomTileLayer from '@/lib/map/createKingdomTileLayer';
import { readMapPalette } from '@/lib/map/mapPalette';

export default function KingdomMapTiles() {
  const map = useMap();
  useEffect(() => {
    let mounted = true;
    const palette = readMapPalette(map.getContainer());
    const roads = createKingdomTileLayer(palette, true, () => mounted).addTo(map);
    const attribution = L.control.attribution({ prefix: false }).addTo(map);
    attribution.addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> · Road accents: <a href="https://www.arcgis.com/home/item.html?id=274684d7a9d74ca4b87f529776feb3a2" target="_blank" rel="noopener noreferrer">Esri &amp; contributors</a>');
    return () => { mounted = false; map.removeLayer(roads); map.removeControl(attribution); };
  }, [map]);
  return <TileLayer
    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    className="sk-street-tiles" zIndex={1} maxNativeZoom={19} maxZoom={19}
  />;
}