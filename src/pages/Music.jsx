import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, ExternalLink, Music as MusicIcon } from "lucide-react";

const FB = "#1877f2";

// Verified YouTube music videos. Each tile opens the video plus an auto-generated
// radio mix (list=RD<id>) so YouTube keeps playing related songs.
const GENRES = [
  { label: "Pop", id: "JGwWNGJdvx8" },
  { label: "Hip-hop", id: "tvTRZJ-4EyI" },
  { label: "R&B", id: "4NRXx6U8ABQ" },
  { label: "Rock", id: "hTWKbfoikeg" },
  { label: "Latin", id: "kJQP7kiw5Fk" },
  { label: "Country", id: "r7qovpFAGrQ" },
  { label: "Funk", id: "OPf0YbXqDm0" },
  { label: "K-pop", id: "9bZkp7q19f0" },
  { label: "Alt", id: "DyDfgMOUjCI" },
  { label: "Throwback", id: "RgKAFK5djSk" }
];

export default function Music() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [blockedUrl, setBlockedUrl] = useState("");

  const openYouTube = (event, url) => {
    event.preventDefault();
    setBlockedUrl("");
    try {
      // Navigate the browser tab itself: no popup and no framed YouTube page.
      // Keep this synchronous so the browser retains the user's click activation.
      window.top.location.href = url;
    } catch {
      setBlockedUrl(url);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Music</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <div className="px-4 mt-5">
        <p className="text-sm text-gray-500">
          Tap a genre to open it in YouTube, or search for any song or artist.
        </p>
      </div>

      {/* Search uses the same direct navigation as the genre links. */}
      <div className="px-4 mt-4">
        <form
          action="https://www.youtube.com/results"
          method="get"
          target="_top"
          onSubmit={(event) => openYouTube(event, `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`)}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="search_query"
              type="search"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any song or artist on YouTube"
              className="w-full pl-9 pr-3 h-11 rounded-full bg-gray-100 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 inline-flex items-center gap-1 rounded-full px-4 text-sm font-semibold text-white"
            style={{ background: FB }}
          >
            <ExternalLink size={15} /> Search
          </button>
        </form>
      </div>

      {/* Genre tiles — each opens the video + a radio mix on YouTube */}
      <div className="px-4 mt-6">
        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <MusicIcon size={15} /> Pick a genre
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GENRES.map((g) => (
            <a
              key={g.id}
              href={`https://www.youtube.com/watch?v=${g.id}&list=RD${g.id}`}
              target="_top"
              onClick={(event) => openYouTube(event, event.currentTarget.href)}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-left inline-flex items-center justify-between"
              style={{ background: "#eef2f7", color: "#1f2937" }}
            >
              {g.label}
              <ExternalLink size={14} style={{ color: FB }} />
            </a>
          ))}
        </div>
      </div>

      <div className="px-4 mt-6">
        <a
          href="https://www.youtube.com"
          target="_top"
          onClick={(event) => openYouTube(event, event.currentTarget.href)}
          className="inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: FB }}
        >
          <ExternalLink size={12} /> Open YouTube
        </a>
      </div>
      {blockedUrl && (
        <div role="alert" className="mx-4 mt-4 rounded-lg border border-border bg-muted p-3 text-sm text-foreground">
          <p>This browser prevented YouTube from opening. Copy this address into your browser to continue:</p>
          <input
            aria-label="YouTube address"
            value={blockedUrl}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
            className="mt-2 w-full rounded border border-input bg-background p-2 text-foreground"
          />
        </div>
      )}
    </div>
  );
}