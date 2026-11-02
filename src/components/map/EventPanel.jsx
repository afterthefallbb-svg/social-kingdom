import React from "react";
import EventCard from "@/components/map/EventCard";

/* The floating left column of gatherings, closest first. */
export default function EventPanel({ events = [], count = 0, onSelect }) {
  return (
    <section className="sk-map-panel" data-tour="event-list">
      <div className="sk-map-panel-head">
        <h2>Current Events</h2>
        <span className="sk-map-panel-count">{count}</span>
      </div>
      <div className="sk-map-cards no-scrollbar">
        {events.length === 0 ? (
          <p className="sk-ev-empty">No gatherings match this view yet.</p>
        ) : (
          events.map((ev) => <EventCard key={ev.id} event={ev} onSelect={onSelect} />)
        )}
      </div>
    </section>
  );
}