import React from "react";
import { NavLink } from "react-router-dom";
import { User, Navigation, Plus } from "lucide-react";

const FB = "#1877f2";
const SIZE = 30;
const BOX = "w-12 h-12 flex items-center justify-center";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[600] flex justify-around items-center pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pointer-events-none">
      {/* Left — person silhouette in a circular badge */}
      <NavLink to="/browse" className="pointer-events-auto" aria-label="Browse">
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
      <NavLink to="/create" className="pointer-events-auto" aria-label="Create event">
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