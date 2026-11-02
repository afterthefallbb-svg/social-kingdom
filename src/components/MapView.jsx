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

export default function MapView({ events = [], activeId, onSelect, mode = "events", center = WALLA_WALLA }) {
  const isEvents = mode === "events";
  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom
      style={{ position: "absolute", inset: 0, background: "#050a14", zIndex: 0 }}
    >
      {isEvents ? (
        <>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            className="sk-tile-base"
            maxNativeZoom={16}
            maxZoom={19}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
            className="sk-tile-roads"
            maxNativeZoom={19}
            maxZoom={19}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            className="sk-tile-labels"
            maxNativeZoom={16}
            maxZoom={19}
          />
        </>
      ) : (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      )}
      <Recenter center={center} />
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