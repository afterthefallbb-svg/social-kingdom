import React from "react";
import "@/components/hub/kingdom-accents.css";

const bolts = [
  { left: "-5%", top: "24%", width: "18%", rotate: -16, tone: "cyan", delay: "0s", path: "M58 2 L34 82 L62 98 L26 218" },
  { left: "26%", top: "33%", width: "14%", rotate: 24, tone: "gold", delay: "3.1s", path: "M62 4 L40 86 L66 100 L34 214" },
  { left: "58%", top: "26%", width: "12%", rotate: -30, tone: "cyan", delay: "6.4s", path: "M54 2 L28 78 L56 92 L20 216" },
  { left: "86%", top: "38%", width: "16%", rotate: 18, tone: "gold", delay: "1.8s", path: "M60 4 L38 84 L64 98 L30 212" },
  { left: "6%", top: "52%", width: "19%", rotate: 10, tone: "gold", delay: "5.2s", path: "M56 2 L30 80 L58 94 L24 214" },
  { left: "44%", top: "58%", width: "15%", rotate: -22, tone: "cyan", delay: "8.3s", path: "M58 2 L34 82 L62 98 L26 218" },
  { left: "78%", top: "66%", width: "13%", rotate: 34, tone: "gold", delay: "4.4s", path: "M62 4 L40 86 L66 100 L34 214" },
  { left: "14%", top: "80%", width: "17%", rotate: -12, tone: "cyan", delay: "6.9s", path: "M54 2 L28 78 L56 92 L20 216" },
  { left: "72%", top: "86%", width: "18%", rotate: -26, tone: "cyan", delay: "2.2s", path: "M60 4 L38 84 L64 98 L30 212" },
];

export default function KingdomAccents() {
  return (
    <div className="kingdom-accents" aria-hidden="true">
      {bolts.map((b, i) => (
        <svg
          key={i}
          className={`kingdom-bolt kingdom-bolt-${b.tone}`}
          style={{ left: b.left, top: b.top, width: b.width, animationDelay: b.delay, "--bolt-rotate": `${b.rotate}deg` }}
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