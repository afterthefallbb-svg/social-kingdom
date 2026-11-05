import React from "react";
import { format, isValid } from "date-fns";
import { CalendarDays, MapPin, X } from "lucide-react";
import { Image } from "@/components/ui/sk-image";

const FB = "#1877f2";

function when(startTime) {
  const d = startTime ? new Date(startTime) : null;
  return d && isValid(d) ? format(d, "EEEE, MMM d • h:mm a") : "Date to be announced";
}

/* What a visitor sees when they tap an example gathering: the host, the people
   going, and a post from one of them — then the invite to make an account. */
export default function ExampleEventSheet({ event, onClose, onSignUp }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-[650] flex items-end" role="dialog" aria-label={event.title}>
      <button className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-h-[86dvh] overflow-y-auto rounded-t-2xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="relative">
          <Image src={event.image_url} fittingType="fill" className="w-full h-44" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/55 text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-3">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{event.title}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
            <CalendarDays size={13} /> {when(event.start_time)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin size={13} /> {event.address}
            {event.distanceMi != null && <span className="text-gray-400">· {event.distanceMi.toFixed(1)} mi</span>}
          </p>
          {event.description && (
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">{event.description}</p>
          )}

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-50 p-2">
            <span className="w-9 h-9 rounded-full overflow-hidden bg-white shrink-0">
              <Image src={event.host_avatar} fittingType="fill" className="w-full h-full" />
            </span>
            <span className="text-sm">
              <span className="block font-semibold text-gray-900">Hosted by {event.host_name}</span>
              <span className="block text-[11px] text-gray-500">Official Social Kingdom gathering</span>
            </span>
          </div>

          {event.attendees?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-800">
                {event.attendees.length} going
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {event.attendees.map((p) => (
                  <span key={p.id} className="flex items-center gap-1.5 rounded-full bg-gray-100 pr-2.5">
                    <span className="w-7 h-7 rounded-full overflow-hidden">
                      <Image src={p.avatar} fittingType="fill" className="w-full h-full" />
                    </span>
                    <span className="text-[11px] font-medium text-gray-700">{p.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.post && (
            <div className="mt-3 rounded-xl border border-gray-200 p-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full overflow-hidden">
                  <Image src={event.post.author_avatar} fittingType="fill" className="w-full h-full" />
                </span>
                <span className="text-xs font-semibold text-gray-900">{event.post.author_name}</span>
                <span className="text-[10px] text-gray-400">going</span>
              </div>
              <p className="mt-1.5 text-sm text-gray-800 leading-snug">{event.post.content}</p>
            </div>
          )}

          <button
            onClick={onSignUp}
            className="mt-4 w-full rounded-xl py-3.5 text-base font-bold text-white"
            style={{ background: FB }}
          >
            Sign up to join
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-500">
            This is an example gathering. Sign up to see what's happening near you.
          </p>
        </div>
      </div>
    </div>
  );
}