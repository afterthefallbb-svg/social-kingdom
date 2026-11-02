import React from "react";

/* Familiar map-app compass: a thin ring with four cardinal spokes
   (north / east / south / west) and a gold north tip. Nothing behind it —
   the mark floats over the map on its own shadow and glow. */
export default function MapCompass({ locating = false }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={locating ? "sk-compass is-locating" : "sk-compass"}
      aria-hidden="true"
      focusable="false"
    >
      <circle className="sk-compass-ring" cx="24" cy="24" r="18.5" />
      <circle className="sk-compass-inner" cx="24" cy="24" r="12.5" />
      <path className="sk-compass-spoke sk-compass-n" d="M24 7.5v7.5" />
      <path className="sk-compass-spoke" d="M40.5 24H33" />
      <path className="sk-compass-spoke" d="M24 40.5V33" />
      <path className="sk-compass-spoke" d="M7.5 24H15" />
      <path className="sk-compass-tip" d="M24 2.4l3 4.6h-6z" />
      <circle className="sk-compass-dot" cx="24" cy="24" r="1.7" />
    </svg>
  );
}