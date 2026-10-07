import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getCategory } from "@/lib/categories";

const FB = "#1877f2";

export default function EventsSection({ events, onSelect }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="font-bold text-gray-900 flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
            style={{ background: FB }}
          >
            📅
          </span>
          Events
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {events.length === 0 && <p className="text-xs text-gray-400">No upcoming events.</p>}
          {events.map((e) => {
            const cat = getCategory(e.category);
            return (
              <button
                key={e.id}
                onClick={() => onSelect(e)}
                className="w-full flex items-center justify-between rounded-xl border p-2.5 hover:bg-gray-50"
                style={{ borderColor: "#eef0f3" }}
              >
                <span className="text-sm font-medium text-gray-800 truncate text-left">{e.title}</span>
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ml-2"
                  style={{ background: cat.color + "22" }}
                  title={cat.label}
                >
                  {cat.emoji}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}