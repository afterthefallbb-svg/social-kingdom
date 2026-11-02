import React from "react";
import "@/components/hub/kingdom-accents.css";

const bolts = [
  { left: "1%", top: "30%", width: "13%", tone: "cyan", delay: "0s" },
  { left: "86%", top: "42%", width: "11%", tone: "gold", delay: "2.6s" },
  { left: "58%", top: "56%", width: "12%", tone: "cyan", delay: "5.1s" },
  { left: "6%", top: "70%", width: "14%", tone: "gold", delay: "7.4s" },
  { left: "78%", top: "84%", width: "10%", tone: "cyan", delay: "3.8s" },
];

const pathFor = (i) => [
  "M56 2 L34 82 L60 96 L26 216",
  "M70 4 L52 88 L74 104 L46 210",
  "M48 6 L26 78 L54 92 L20 208",
  "M64 2 L40 90 L66 102 L34 214",
  "M50 4 L30 86 L56 98 L24 212",
][i % 5];

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
          <path className="kingdom-bolt-halo" d={pathFor(i)} />
          <path className="kingdom-bolt-core" d={pathFor(i)} />
        </svg>
      ))}
    </div>
  );
}