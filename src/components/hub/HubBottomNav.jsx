import React from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { Navigation, Plus, UserRound } from "lucide-react";
import "@/components/hub/kingdom.css";
import "@/components/hub/kingdom-materials.css";

/* The orb navigation is mounted on document.body: no page wrapper, scroll
   container, transform or stacking context can move it or paint over it, so the
   three orbs stay pinned to the bottom of the screen while anything scrolls. */
export default function HubBottomNav() {
  if (typeof document === "undefined") return null;

  return createPortal(
    <nav className="kingdom-bottom-nav" aria-label="Main navigation">
      <NavLink to="/browse" data-tour="hub-button" aria-label="Browse" className="kingdom-orb kingdom-orb-gold"><UserRound /></NavLink>
      <NavLink to="/" aria-label="Map" className="kingdom-orb kingdom-orb-blue"><Navigation fill="currentColor" /></NavLink>
      <NavLink to="/create" data-tour="create-button" aria-label="Create event" className="kingdom-orb kingdom-orb-gold"><Plus /></NavLink>
    </nav>,
    document.body
  );
}