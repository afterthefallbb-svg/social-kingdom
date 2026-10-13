import React from "react";

// Clout badge: thumbs-up + total + crown. No text, no bubble.
export default function KloutBadge({ count = 0, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span aria-hidden>👍</span>
      {typeof count === "number" && <span className="font-bold">{count}</span>}
      <span aria-hidden>👑</span>
    </span>
  );
}