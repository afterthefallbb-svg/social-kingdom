import React from "react";

// Narrow left-side list of raw event names floating over the map.
// Sorted by distance (closest first) by the parent. No background boxes.
export default function EventSideList({ events = [], activeId, onSelect }) {
  return (
    <div className="absolute left-3 z-[500] max-w-[58%]" style={{ top: 150 }}>
      <h3
        className="text-[13px] font-bold text-white"
        style={{
          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          borderBottom: "2px solid #ffffff",
          paddingBottom: 2,
          display: "inline-block"
        }}
      >
        Events in your area
      </h3>
      <ul className="mt-1.5 flex flex-col" style={{ rowGap: 2 }}>
        {events.map((ev) => (
          <li key={ev.id}>
            <button
              onClick={() => onSelect && onSelect(ev)}
              className="text-left text-[12px] leading-tight text-white"
              style={{
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                fontWeight: ev.id === activeId ? 700 : 400
              }}
            >
              {ev.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}