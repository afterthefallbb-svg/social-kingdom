import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getCategory } from "@/lib/categories";

const FB = "#1877f2";

export default function EventsSection({ events, onSelect }) {
  const [open, setOpen] = useState(true);

  const fmt = (d) => {
    const dt = new Date(d);
    const m = dt.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return `${m} ${dt.getDate()}`;
  };

  return (
    <div className="p-4" style={{ textShadow: "0 1px 4px rgba(255,255,255,0.95)" }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="font-bold text-gray-900">Events</span>
        <ChevronDown size={18} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {events.length === 0 && <p className="text-xs text-gray-400">No upcoming events.</p>}
          {events.map((e) => {
            const cat = getCategory(e.category);
            return (
              <button
                key={e.id}
                onClick={() => onSelect(e)}
                className="w-full flex items-center gap-2 py-1.5 group"
              >
                {e.start_time && (
                  <span className="text-[11px] font-semibold text-gray-500 shrink-0 w-12">{fmt(e.start_time)}</span>
                )}
                <span
                  className="text-sm font-medium truncate flex-1 text-left group-hover:underline"
                  style={{ color: FB }}
                >
                  {e.title}
                </span>
                <span className="text-lg shrink-0">{cat.emoji}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}