import React from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { makeEventIcon } from "@/lib/mapMarker";

export const WALLA_WALLA = [46.0646, -118.3425];

function Recenter({ center }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function MapView({ events = [], activeId, onSelect, mode = "events" }) {
  const isEvents = mode === "events";
  return (
    <MapContainer
      center={WALLA_WALLA}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom
      style={{ position: "absolute", inset: 0, background: "#aadaff", zIndex: 0 }}
    >
      {isEvents ? (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          className="meetme-tiles"
          maxZoom={19}
        />
      ) : (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      )}
      <Recenter center={WALLA_WALLA} />
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