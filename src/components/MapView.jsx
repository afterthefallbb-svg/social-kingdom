import React from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { makeEventIcon } from "@/lib/mapMarker";
import KingdomMapTiles from "@/components/map/KingdomMapTiles";
import { basemapTiles } from "@/lib/map/basemapTiles";

export const WALLA_WALLA = [46.0646, -118.3425];

function Recenter({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ events = [], activeId, onSelect, mode = "events", center = WALLA_WALLA, zoom = 13 }) {
  const isEvents = mode === "events";
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom
      style={{ position: "absolute", inset: 0, background: "var(--map-day-ground)", zIndex: 0 }}
    >
      {isEvents ? (
        <KingdomMapTiles />
      ) : (
        <TileLayer {...basemapTiles()} />
      )}
      <Recenter center={center} zoom={zoom} />
      {isEvents &&
        events.map((ev) => (
          <Marker
            key={ev.id}
            position={[ev.latitude, ev.longitude]}
            icon={makeEventIcon(ev.category, ev.id === activeId)}
            eventHandlers={{ click: () => onSelect && onSelect(ev) }}
          />
        ))}
    </MapContainer>
  );
}