import React from "react";

// Official platform players. YouTube and TikTok each render inside their own
// iframe, so the clip keeps its native quality, captions, and controls inside
// our player window. The iframe only reloads with autoplay when its slide is
// the active one, so scrolling does not fire a dozen embeds at once.
export default function EmbedFrame({ provider, videoId, active, title }) {
  if (!videoId) return null;

  if (provider === "tiktok") {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <iframe
          key={active ? "active" : "idle"}
          src={`https://www.tiktok.com/embed/v2/${videoId}`}
          title={title || "TikTok video"}
          className="h-full w-full max-w-[440px] border-0"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading={active ? "eager" : "lazy"}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-black">
      <div className="w-full aspect-video">
        <iframe
          key={active ? "active" : "idle"}
          src={`https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&autoplay=${active ? 1 : 0}`}
          title={title || "YouTube video"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading={active ? "eager" : "lazy"}
        />
      </div>
    </div>
  );
}