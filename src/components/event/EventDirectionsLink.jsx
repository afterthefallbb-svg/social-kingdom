import React, { useState } from "react";
import { Navigation } from "lucide-react";
import { eventDirectionsUrl } from "@/lib/directions";
import DirectionsOpenFallback from "@/components/event/DirectionsOpenFallback";

export default function EventDirectionsLink({ event, className = "", filledIcon = false }) {
  const [attempted, setAttempted] = useState(false);
  const href = eventDirectionsUrl(event);
  const isEmbedded = typeof window !== "undefined" && window.self !== window.top;
  const classes = `relative z-[601] pointer-events-auto touch-manipulation w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground font-semibold ${className}`;
  if (!href) {
    return <button type="button" disabled className={`${classes} opacity-50`}>Directions unavailable</button>;
  }
  return (
    <>
      <a
        href={href}
        target={isEmbedded ? "_blank" : "_self"}
        rel="noopener noreferrer"
        onClick={() => setAttempted(true)}
        className={classes}
        aria-label={`Start Directions to ${event.title || "the event"}`}
      >
        <Navigation size={18} fill={filledIcon ? "currentColor" : "none"} />
        Start Directions
      </a>
      {attempted && <DirectionsOpenFallback url={href} />}
    </>
  );
}