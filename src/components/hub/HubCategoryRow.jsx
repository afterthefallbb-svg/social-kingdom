import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, CirclePlay, MapPin, Palette, Users } from "lucide-react";
import HubCard from "@/components/hub/HubCard";

const icons = { stream: CirclePlay, events: MapPin, artists: Palette, cliqs: Users };

export default function HubCategoryRow({ title, kind, onTitle, items = [], emptyText, onVideoClick }) {
  const track = useRef(null);
  const Icon = icons[kind] || Users;
  const stream = kind === "stream";
  function scroll(direction) {
    const node = track.current;
    if (!node) return;
    const end = node.scrollWidth - node.clientWidth;
    const wrap = direction < 0 && node.scrollLeft <= 1 ? end : direction > 0 && node.scrollLeft >= end - 1 ? 0 : node.scrollLeft + direction * node.clientWidth;
    node.scrollTo({ left: wrap, behavior: "smooth" });
  }
  return (
    <section className={`kingdom-panel kingdom-panel-${kind}`} aria-label={title}>
      <div className="kingdom-panel-heading">
        <button type="button" onClick={onTitle} className="kingdom-panel-title"><Icon /><span>{title}</span></button>
        <button type="button" onClick={onTitle} className="kingdom-see-all" aria-label={`See all ${title}`}><span>See All</span><ChevronRight /></button>
      </div>
      {items.length ? (
        <div ref={track} className="kingdom-track no-scrollbar">
          {items.map((item, index) => <HubCard key={item.id} item={item} stream={stream} onClick={() => item.isVideo && onVideoClick ? onVideoClick(index) : item.onClick?.()} />)}
        </div>
      ) : <p className="kingdom-empty">{emptyText}</p>}
      {stream && items.length > 4 && <>
        <button type="button" className="kingdom-scroll-arrow kingdom-scroll-prev" onClick={() => scroll(-1)} aria-label={`Previous ${title}`}><ChevronLeft /></button>
        <button type="button" className="kingdom-scroll-arrow kingdom-scroll-next" onClick={() => scroll(1)} aria-label={`Next ${title}`}><ChevronRight /></button>
      </>}
    </section>
  );
}