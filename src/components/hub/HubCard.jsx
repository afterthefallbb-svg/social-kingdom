import React from "react";
import { MessageCircle, Play, UserRound, Users } from "lucide-react";
import { Image } from "@/components/ui/sk-image";
import { coverPhoto } from "@/lib/coverPhotos";

export default function HubCard({ item, stream, onClick }) {
  const fallback = coverPhoto(item.id || item.label, item.category, item.kind || (stream ? "stream" : ""));
  return (
    <button type="button" onClick={onClick} className={`kingdom-card ${stream ? "kingdom-card-stream" : ""}`}>
      <span className="kingdom-card-picture">
        <Image src={item.image} fallback={fallback} alt="" className="h-full w-full" />
        {item.isVideo && <Play className="kingdom-card-play" fill="currentColor" />}
      </span>
      <span className="kingdom-card-content">
        <span className="kingdom-card-title">{item.label}</span>
        {stream ? (
          <>
            <span className="kingdom-card-author">
              <span className="kingdom-mini-avatar">{item.avatar ? <Image src={item.avatar} alt="" className="h-full w-full" /> : <UserRound />}</span>
              <span><span className="kingdom-author-name">{item.author || "Featured video"}</span><span className="kingdom-card-time">{item.time || "Explore Stream"}</span></span>
            </span>
            <span className="kingdom-card-footer"><span><Play fill="currentColor" />Watch</span><MessageCircle /><span aria-hidden="true">•••</span></span>
          </>
        ) : (
          <span className="kingdom-card-meta"><Users /><span>{item.meta || "Discover more"}</span></span>
        )}
      </span>
    </button>
  );
}