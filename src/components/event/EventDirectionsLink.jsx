import React from "react";
import { Navigation } from "lucide-react";
import { eventDirectionsUrl } from "@/lib/directions";

export default function EventDirectionsLink({ event, className = "", filledIcon = false }) {
  const href = eventDirectionsUrl(event);
  const classes = `relative z-[601] pointer-events-auto touch-manipulation min-h-12 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground font-semibold ${className}`;
  if (!href) {
    return (
      <button type="button" disabled className={`${classes} opacity-50`}>
        <Navigation size={18} aria-hidden="true" />
        Directions unavailable
      </button>
    );
  }
  return (
    <a
      href={href}
      // Leave the embedded app instead of requesting a new window.
      // Keep browser navigation synchronous with the user's tap.
      target="_top"
      rel="noopener noreferrer"
      className={classes}
      aria-label={`Start Directions to ${event.title || "the event"}`}
    >
      <Navigation size={18} aria-hidden="true" fill={filledIcon ? "currentColor" : "none"} />
      Start Directions
    </a>
  );
}