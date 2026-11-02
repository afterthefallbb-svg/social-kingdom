import React from "react";
import { format, isValid } from "date-fns";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import { EVENT_SAMPLES } from "@/lib/hubSamples";

/* Which example photo stands in for an event that has no picture of its own. */
const SAMPLE_BY_CATEGORY = {
  sports: 7,
  barbecue: 0,
  drinks: 1,
  artists: 2,
  local_sale: 3,
  family: 4,
  kids: 4,
  daycare: 4,
  religious: 4,
  professional: 5,
  resource_fairs: 5,
  activities: 6,
  parties: 9,
  automotive: 3,
};

function sampleImage(ev) {
  if (ev.image_url) return ev.image_url;
  const indexed = SAMPLE_BY_CATEGORY[ev.category];
  const fallback = [...(ev.id || ev.title || "event")].reduce((a, c) => a + c.charCodeAt(0), 0);
  const pick = indexed ?? fallback;
  return EVENT_SAMPLES[pick % EVENT_SAMPLES.length].image;
}

function when(startTime) {
  const d = startTime ? new Date(startTime) : null;
  return d && isValid(d) ? format(d, "EEE, MMM d • h:mm a") : "Date to be announced";
}

/* Rounded gold event card in the left column. */
export default function EventCard({ event, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(event)} className="sk-ev-card">
      <span className="sk-ev-thumb">
        <Image src={sampleImage(event)} alt="" fittingType="fill" className="h-full w-full" />
      </span>
      <span className="sk-ev-body">
        <span className="sk-ev-title">{event.title}</span>
        <span className="sk-ev-meta">
          <Clock />
          {when(event.start_time)}
        </span>
        <span className="sk-ev-meta">
          <MapPin />
          {event.address || "Location on map"}
        </span>
        <span className="sk-ev-foot">
          <span className="sk-ev-dist">
            {event.distanceMi != null ? `${event.distanceMi.toFixed(1)} mi` : "Nearby"}
          </span>
          <ChevronRight className="sk-ev-arrow" />
        </span>
      </span>
    </button>
  );
}