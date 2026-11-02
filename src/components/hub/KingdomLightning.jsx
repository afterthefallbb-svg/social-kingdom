import React from "react";

export default function KingdomLightning() {
  return (
    <div className="kingdom-electrics" aria-hidden="true">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <path className="kingdom-bolt" d="M8 -2 L13 8 L9 9 L18 21 L13 22 L22 40" />
        <path className="kingdom-bolt kingdom-bolt-gold" d="M21 -2 L25 9 L21 10 L29 22 L24 23 L33 40" />
        <path className="kingdom-bolt kingdom-bolt-faint" d="M74 -2 L69 10 L76 11 L68 24 L74 25 L66 40" />
        <path className="kingdom-bolt" d="M90 -2 L86 9 L92 10 L84 23 L90 24 L82 40" />
        <path className="kingdom-bolt kingdom-bolt-gold" d="M50 8 L55 16 L51 17 L58 26 L53 27 L60 36" />
      </svg>
    </div>
  );
}