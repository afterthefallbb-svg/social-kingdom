import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Navigation, MapPin, Globe, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import { Image } from "@/components/ui/image";
import EventAttending from "@/components/event/EventAttending";
import EventPhotos from "@/components/event/EventPhotos";
import EventPosts from "@/components/event/EventPosts";
import KloutButton from "@/components/klout/KloutButton";

const FB = "#1877f2";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [click, setClick] = useState(null);

  useEffect(() => {
    if (!id) return;
    base44.entities.Event.get(id).then(setEvent).catch(() => setEvent(null));
  }, [id]);

  useEffect(() => {
    if (event?.click_id) {
      base44.entities.Click.get(event.click_id).then(setClick).catch(() => setClick(null));
    } else {
      setClick(null);
    }
  }, [event]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  const cat = getCategory(event.category);
  const isPersonal = event.visibility === "personal";

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="bg-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="font-bold text-gray-900 truncate">Event</h1>
        </div>

        <div
          className="h-40 relative flex items-center justify-center text-7xl"
          style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}
        >
          {cat.emoji}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: cat.color }}>
              {cat.label}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: isPersonal ? "#64748b" : FB }}
            >
              {isPersonal ? <><Lock size={10} /> Private</> : <><Globe size={10} /> Public</>}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          {event.address && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin size={14} /> {event.address}
            </div>
          )}

          <div className="mt-2">
            <KloutButton target_type="event" target_id={event.id} />
          </div>

          {click && (
            <Link
              to={`/clicks/${click.id}`}
              className="inline-flex items-center gap-2 mt-2 text-sm font-semibold"
              style={{ color: FB }}
            >
              <span
                className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-bold"
                style={{ color: FB }}
              >
                {click.avatar_url ? (
                  <Image src={click.avatar_url} fittingType="fill" className="w-full h-full" />
                ) : (
                  (click.name || "?").charAt(0)
                )}
              </span>
              Hosted by {click.name}
            </Link>
          )}

          {event.description && <p className="text-sm text-gray-600 mt-3">{event.description}</p>}

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-white font-semibold"
            style={{ background: FB }}
          >
            <Navigation size={18} /> Get Directions
          </a>
        </div>
      </div>

      <div className="p-3 space-y-3 max-w-2xl mx-auto">
        <EventAttending eventId={event.id} />
        <EventPhotos eventId={event.id} />
        <EventPosts eventId={event.id} />
      </div>
    </div>
  );
}