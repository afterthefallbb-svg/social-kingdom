import React from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import { getCategory } from "@/lib/categories";

const FB = "#1877f2";

// Exactly the hub's card shape: square picture on top, title and details
// stacked beneath it. Never a circle.
export default function ProfileEventCard({ event, onSelect }) {
  const cat = getCategory(event.category);
  const when = event.start_time
    ? new Date(event.start_time).toLocaleString("en-US", { month: "short", day: "numeric" })
    : "Date to be announced";
  const place = event.address || "";

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="w-[112px] shrink-0 text-left"
    >
      <span className="relative block aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-blue-50 shadow-sm">
        {event.image_url ? (
          <Image src={event.image_url} fittingType="fill" className="w-full h-full" />
        ) : (
          <span className="grid h-full w-full place-items-center text-3xl">{cat.emoji}</span>
        )}
      </span>
      <span className="mt-1.5 block text-[11.5px] font-bold leading-tight text-gray-900 line-clamp-2">
        {event.title}
      </span>
      <span className="mt-0.5 flex items-center gap-1 text-[10.5px] font-medium" style={{ color: FB }}>
        <CalendarDays size={10} className="shrink-0" />
        <span className="truncate">{when}</span>
      </span>
      {place && (
        <span className="flex items-center gap-1 text-[10.5px] text-gray-500">
          <MapPin size={10} className="shrink-0" />
          <span className="truncate">{place}</span>
        </span>
      )}
    </button>
  );
}