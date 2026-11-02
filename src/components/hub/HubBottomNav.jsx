import React from "react";
import { NavLink } from "react-router-dom";
import { Navigation, Plus, UserRound } from "lucide-react";
import "@/components/hub/kingdom.css";
import "@/components/hub/kingdom-materials.css";

export default function HubBottomNav() {
  return (
    <nav className="kingdom-bottom-nav" aria-label="Main navigation">
      <NavLink to="/browse" data-tour="hub-button" aria-label="Browse" className="kingdom-orb kingdom-orb-gold"><UserRound /></NavLink>
      <NavLink to="/" aria-label="Map" className="kingdom-orb kingdom-orb-blue"><Navigation fill="currentColor" /></NavLink>
      <NavLink to="/create" data-tour="create-button" aria-label="Create event" className="kingdom-orb kingdom-orb-gold"><Plus /></NavLink>
    </nav>
  );
}