import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import ProfileEventCard from "@/components/profile/ProfileEventCard";

const FB = "#1877f2";

export default function EventsSection({ events, onSelect }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-4" style={{ textShadow: "0 1px 4px rgba(255,255,255,0.95)" }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="font-bold text-gray-900">Events</span>
        <ChevronDown size={18} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3">
          {events.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming events.</p>
          ) : (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {events.map((e) => (
                <ProfileEventCard key={e.id} event={e} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}