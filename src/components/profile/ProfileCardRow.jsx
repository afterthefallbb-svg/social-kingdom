import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import HubCard from "@/components/hub/HubCard";
import "@/components/profile/profile-card-row.css";

const FB = "#1877f2";

// A profile row is the social hub's row: the very same HubCard inside the same
// snap-scrolling track. Items carry { id, label, image, emoji, meta, onClick }.
export default function ProfileCardRow({ title, badge, items = [], emptyText, renderOverlay }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-4" style={{ textShadow: "0 1px 4px rgba(255,255,255,0.95)" }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="font-bold text-gray-900 flex items-center gap-2">
          {badge && (
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
              style={{ background: FB }}
            >
              {badge}
            </span>
          )}
          {title}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        (items.length ? (
          <div className="mt-3 profile-card-track">
            <div className="kingdom-track no-scrollbar" style={{ textShadow: "none" }}>
              {items.map((item) => (
                <div key={item.id} className="relative">
                  <HubCard item={item} onClick={item.onClick} />
                  {renderOverlay?.(item)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-gray-400">{emptyText}</p>
        ))}
    </div>
  );
}