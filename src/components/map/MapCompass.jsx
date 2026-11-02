import React from "react";

/* Familiar map-app compass: a ring with four cardinal ticks radiating
   outwards (north / east / south / west) — dark enough to sit on a white
   basemap, with nothing behind it. */
export default function MapCompass({ locating = false }) {
  return (
    <svg
      viewBox="0 0 56 56"
      className={locating ? "sk-compass is-locating" : "sk-compass"}
      aria-hidden="true"
      focusable="false"
    >
      <circle className="sk-compass-ring" cx="28" cy="28" r="17" />
      <circle className="sk-compass-inner" cx="28" cy="28" r="12.5" />
      {/* Ticks start on the outside of the ring and point outwards. */}
      <path className="sk-compass-spoke sk-compass-n" d="M28 9.9V5.4" />
      <path className="sk-compass-spoke" d="M46.1 28h4.5" />
      <path className="sk-compass-spoke" d="M28 46.1v4.5" />
      <path className="sk-compass-spoke" d="M9.9 28H5.4" />
      <circle className="sk-compass-dot" cx="28" cy="28" r="2" />
    </svg>
  );
}