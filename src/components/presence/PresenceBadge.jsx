import React from "react";

// badge = { emoji, online } from presenceBadge()/clickPresenceBadge(), or null.
export default function PresenceBadge({ badge, className = "" }) {
  if (!badge) return null;
  return (
    <span
      className={`absolute bg-white rounded-full px-0.5 leading-none ${badge.online ? "" : "opacity-40 grayscale"} ${className}`}
    >
      {badge.emoji}
    </span>
  );
}