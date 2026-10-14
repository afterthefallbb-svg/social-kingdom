import React from "react";
import { Navigation } from "lucide-react";
import { eventDirectionsUrl } from "@/lib/directions";

export default function EventDirectionsLink({ event, className = "", filledIcon = false }) {
  const href = eventDirectionsUrl(event);
  const classes = `w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground font-semibold ${className}`;
  if (!href) {
    return <button type="button" disabled className={`${classes} opacity-50`}>Directions unavailable</button>;
  }
  return (
    <a
      href={href}
      target="_top"
      rel="external"
      className={classes}
      aria-label={`Start Directions to ${event.title || "the event"}`}
    >
      <Navigation size={18} fill={filledIcon ? "currentColor" : "none"} />
      Start Directions
    </a>
  );
}