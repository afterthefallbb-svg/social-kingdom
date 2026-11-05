import React from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { Navigation, Plus, UserRound } from "lucide-react";
import { useTabHistory } from "@/context/TabHistoryContext";
import "@/components/hub/kingdom.css";
import "@/components/hub/kingdom-materials.css";

/* The orb navigation is mounted on document.body: no page wrapper, scroll
   container, transform or stacking context can move it or paint over it, so the
   three orbs stay pinned to the bottom of the screen while anything scrolls. */
export default function HubBottomNav() {
  const { pathname } = useLocation();
  const { restoreTab } = useTabHistory();

  if (typeof document === "undefined") return null;

  const tabbed = (tab, isActive) => (e) => {
    // Re-tapping the tab you are on resets it to its root page.
    if (isActive) {
      e.preventDefault();
      restoreTab(tab);
    }
  };

  const onBrowse = pathname === "/browse" || pathname.startsWith("/browse/");
  const onMap = pathname === "/";
  const onCreate = pathname === "/create" || pathname.startsWith("/create/");

  return createPortal(
    <nav className="kingdom-bottom-nav" aria-label="Main navigation">
      <NavLink
        to="/browse"
        data-tour="hub-button"
        aria-label="Browse"
        onClick={tabbed("browse", onBrowse)}
        className="kingdom-orb kingdom-orb-gold"
      >
        <UserRound />
      </NavLink>
      <NavLink to="/" aria-label="Map" onClick={tabbed("map", onMap)} className="kingdom-orb kingdom-orb-blue">
        <Navigation fill="currentColor" />
      </NavLink>
      <NavLink
        to="/create"
        data-tour="create-button"
        aria-label="Create event"
        onClick={tabbed("create", onCreate)}
        className="kingdom-orb kingdom-orb-gold"
      >
        <Plus />
      </NavLink>
    </nav>,
    document.body
  );
}