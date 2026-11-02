import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import KingdomSurface from "@/components/hub/KingdomSurface";
import HubSearchOverlay from "@/components/hub/HubSearchOverlay";
import "@/components/hub/hub-search.css";

/* Opens the in-page Kingdom search instead of navigating away from the hub. */
export default function HubSearch({ onOpenVideo }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="kingdom-search"
        onClick={() => setOpen(true)}
        aria-label="Search events, people, CliQs, artists, videos and groups"
      >
        <KingdomSurface />
        <Search />
        <span>Search...</span>
        <SlidersHorizontal />
      </button>
      {open && <HubSearchOverlay onClose={() => setOpen(false)} onOpenVideo={onOpenVideo} />}
    </>
  );
}