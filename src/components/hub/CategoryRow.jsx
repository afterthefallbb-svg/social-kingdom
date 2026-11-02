import React from "react";
import { ChevronRight, CirclePlay } from "lucide-react";
import HubCard from "@/components/hub/HubCard";
import KingdomSurface from "@/components/hub/KingdomSurface";

// A category row inside the app uses exactly the hub's card treatment: framed
// panel, title bar and a snap-scrolling track of kingdom cards (never circles).
export default function CategoryRow({ title, onTitle, items = [], emptyText = "Nothing here yet.", onVideoClick }) {
  return (
    <section className="kingdom-panel" aria-label={title}>
      <KingdomSurface />
      <div className="kingdom-panel-heading">
        <button type="button" onClick={onTitle} className="kingdom-panel-title"><CirclePlay /><span>{title}</span></button>
        <button type="button" onClick={onTitle} className="kingdom-see-all" aria-label={`See all ${title}`}><span>See All</span><ChevronRight /></button>
      </div>
      {items.length ? (
        <div className="kingdom-track no-scrollbar">
          {items.map((item, index) => (
            <HubCard
              key={item.id}
              item={item}
              stream
              onClick={() => (item.isVideo && onVideoClick ? onVideoClick(index) : item.onClick?.())}
            />
          ))}
        </div>
      ) : (
        <p className="kingdom-empty">{emptyText}</p>
      )}
    </section>
  );
}