import React from "react";

// "Klout" — this app's version of likes, spelled with a K (like Kingdom).
// Rendered as a crown above a bold K + "lout", with the user's klout count.
export default function KloutBadge({ count = 0, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="inline-flex flex-col items-center leading-none">
        <span className="text-[8px] -mb-0.5">👑</span>
        <span className="font-extrabold text-[11px]">K</span>
      </span>
      <span className="text-[11px] font-semibold">lout</span>
      {typeof count === "number" && (
        <span className="text-[11px] font-semibold ml-0.5">{count}</span>
      )}
    </span>
  );
}