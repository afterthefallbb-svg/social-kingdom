import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getCategory } from "@/lib/categories";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

export default function EventsAttendedSection({ events, onSelect }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="font-bold text-gray-900 flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
            style={{ background: FB }}
          >
            ✓
          </span>
          Events Attended
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3">
          {events.length === 0 ? (
            <p className="text-xs text-gray-400">No past events yet.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {events.map((e) => {
                const cat = getCategory(e.category);
                return (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e)}
                    className="flex flex-col items-center gap-1 shrink-0 w-16"
                  >
                    <span
                      className="w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center text-xl"
                      style={{ borderColor: cat.color, background: cat.color + "22" }}
                    >
                      {e.image_url ? (
                        <Image src={e.image_url} fittingType="fill" className="w-full h-full" />
                      ) : (
                        cat.emoji
                      )}
                    </span>
                    <span className="text-[10px] text-gray-600 text-center leading-tight truncate w-full">
                      {e.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}