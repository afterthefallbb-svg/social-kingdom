import React from "react";
import "@/components/hub/kingdom-accents.css";

const bolts = [
  { left: "-4%", top: "30%", width: "19%", tone: "cyan", delay: "0s", path: "M58 2 L34 82 L62 98 L26 218" },
  { left: "88%", top: "41%", width: "16%", tone: "gold", delay: "2.4s", path: "M62 4 L40 86 L66 100 L34 214" },
  { left: "0%", top: "55%", width: "20%", tone: "gold", delay: "5.2s", path: "M54 2 L28 78 L56 92 L20 216" },
  { left: "90%", top: "68%", width: "15%", tone: "cyan", delay: "7.6s", path: "M60 4 L38 84 L64 98 L30 212" },
  { left: "2%", top: "82%", width: "18%", tone: "cyan", delay: "3.6s", path: "M56 2 L30 80 L58 94 L24 214" },
];

export default function KingdomAccents() {
  return (
    <div className="kingdom-accents" aria-hidden="true">
      {bolts.map((b, i) => (
        <svg
          key={i}
          className={`kingdom-bolt kingdom-bolt-${b.tone}`}
          style={{ left: b.left, top: b.top, width: b.width, animationDelay: b.delay }}
          viewBox="0 0 100 220"
          preserveAspectRatio="xMidYMin meet"
          focusable="false"
        >
          <path className="kingdom-bolt-halo" d={b.path} />
          <path className="kingdom-bolt-core" d={b.path} />
        </svg>
      ))}
    </div>
  );
}