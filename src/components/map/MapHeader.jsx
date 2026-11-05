import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Crown } from "lucide-react";
import HubMenu from "@/components/hub/HubMenu";

/* Map top bar: back, the crowned "Event Map" title, and the hub menu. */
export default function MapHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // The map itself is a root tab — nothing to go back to there.
  const onRoot = pathname === "/";

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/browse");
  };

  return (
    <header className="sk-map-head">
      {onRoot ? (
        <span aria-hidden="true" />
      ) : (
        <button type="button" onClick={goBack} className="sk-map-back">
          <ChevronLeft />
          Back
        </button>
      )}
      <div className="sk-map-title">
        <Crown fill="currentColor" />
        <h1>Event Map</h1>
      </div>
      <HubMenu buttonClassName="sk-map-menu" />
    </header>
  );
}