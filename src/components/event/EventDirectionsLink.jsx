import React, { useRef, useState } from "react";
import { Navigation } from "lucide-react";
import { eventDirectionsUrl } from "@/lib/directions";
import useDirectionsEditMode from "@/components/event/useDirectionsEditMode";

export default function EventDirectionsLink({ event, className = "", filledIcon = false }) {
  const href = eventDirectionsUrl(event);
  const touchStart = useRef(null);
  const lastLaunch = useRef(0);
  const [message, setMessage] = useState("");
  const isEditing = useDirectionsEditMode();
  const classes = `relative z-[601] pointer-events-auto touch-manipulation min-h-12 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground font-semibold ${className}`;
  function launchMaps(e) {
    if (e.type === "click" && (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)) return;
    e.preventDefault();
    if (isEditing) return;
    if (Date.now() - lastLaunch.current < 750) return;
    lastLaunch.current = Date.now();
    setMessage("");
    try {
      if (window.self === window.top) { window.location.assign(href); return; }
      const mapsWindow = window.open(href, "_blank");
      if (mapsWindow) { mapsWindow.opener = null; return; }
    } catch {
      // An external browser handoff can be refused by the browser.
    }
    setMessage("If Maps did not open, press and hold Start Directions and choose Open Link or Copy Link to open it in your browser.");
  }
  function handlePointerUp(e) {
    const start = touchStart.current;
    touchStart.current = null;
    if (e.pointerType !== "mouse" && start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 12) launchMaps(e);
  }
  if (!href) return <button type="button" disabled className={`${classes} opacity-50`}>Directions unavailable</button>;
  return (
    <>
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}
        onPointerDown={(e) => { touchStart.current = { x: e.clientX, y: e.clientY }; }}
        onPointerCancel={() => { touchStart.current = null; }} onPointerUp={handlePointerUp}
        onClick={launchMaps} aria-label={`Start Directions to ${event.title || "the event"}`}>
        <Navigation size={18} aria-hidden="true" fill={filledIcon ? "currentColor" : "none"} />
        Start Directions
      </a>
      {(isEditing || message) && <p role="status" className="mt-2 text-sm text-muted-foreground">{isEditing ? "Leave Edit mode at the top of the editor, then tap Start Directions." : message}</p>}
    </>
  );
}