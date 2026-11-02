import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { User, Navigation, Plus } from "lucide-react";
import HubBottomNav from "@/components/hub/HubBottomNav";

const FB = "#1877f2";
const SIZE = 30;
const BOX = "w-12 h-12 flex items-center justify-center";

export default function BottomNav() {
  const { pathname } = useLocation();
  if (pathname === "/browse") return <HubBottomNav />;
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[650] bg-white/95 backdrop-blur border-t border-gray-200 flex justify-around items-center pt-2 pointer-events-none"
      style={{ paddingBottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem))" }}
    >
      {/* Left — person silhouette in a circular badge */}
      <NavLink to="/browse" className="pointer-events-auto" data-tour="hub-button" aria-label="Browse">
        {({ isActive }) => (
          <span
            className={`${BOX} rounded-full border-2`}
            style={{
              borderColor: FB,
              background: isActive ? FB : "rgba(24,119,242,0.25)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
            }}
          >
            <User size={SIZE} color="#ffffff" strokeWidth={2.25} />
          </span>
        )}
      </NavLink>

      {/* Center — Google Maps navigation arrow */}
      <NavLink to="/" end className="pointer-events-auto" aria-label="Map">
        {({ isActive }) => (
          <span
            className={`${BOX} rounded-full`}
            style={{
              background: FB,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
            }}
          >
            <Navigation size={SIZE} color="#ffffff" strokeWidth={2.25} fill="#ffffff" />
          </span>
        )}
      </NavLink>

      {/* Right — rounded square with plus */}
      <NavLink to="/create" className="pointer-events-auto" data-tour="create-button" aria-label="Create event">
        {({ isActive }) => (
          <span
            className={`${BOX} rounded-2xl`}
            style={{
              background: FB,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
            }}
          >
            <Plus size={SIZE} color="#ffffff" strokeWidth={2.5} />
          </span>
        )}
      </NavLink>
    </nav>
  );
}