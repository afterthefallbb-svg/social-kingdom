import React from "react";

// Narrow left-side list of event names floating over the map.
export default function EventSideList({ events = [], activeId, onSelect }) {
  return (
    <div className="absolute left-3 z-[500] max-w-[58%]" style={{ top: 125 }}>
      <h3
        className="text-[13px] font-bold"
        style={{
          color: "#111111",
          textShadow: "0 1px 4px rgba(255,255,255,0.95)",
          borderBottom: "2px solid #111111",
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
              className="text-left text-[12px] leading-tight"
              style={{
                color: "#111111",
                textShadow: "0 1px 4px rgba(255,255,255,0.95)",
                fontWeight: ev.id === activeId ? 800 : 500
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