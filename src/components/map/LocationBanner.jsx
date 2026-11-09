import React from "react";
import { MapPin, X } from "lucide-react";
import "@/components/map/location-banner.css";

/* A quiet, dismissible nudge — never the browser's own permission popup. The
   device only asks for a location when the person taps Enable Location. */
export default function LocationBanner({ denied, locating, onEnable, onDismiss }) {
  return (
    <div className="sk-loc-banner" role="region" aria-label="Find events near you">
      <MapPin className="sk-loc-pin" aria-hidden="true" />
      <p className="sk-loc-text">
        {denied
          ? "Location is off — type your city or zip code in Search Events."
          : "Find local events happening near you"}
      </p>
      {!denied && (
        <button type="button" className="sk-loc-enable" onClick={onEnable} disabled={locating}>
          {locating ? "Locating…" : "Enable Location"}
        </button>
      )}
      <button type="button" className="sk-loc-close" onClick={onDismiss} aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>
  );
}