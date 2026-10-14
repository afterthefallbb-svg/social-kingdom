import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function SpotifyPlayer({ source }) {
  const [loading, setLoading] = useState(true);
  return (
    <section aria-label="Spotify music player" className="mt-5">
      <h2 className="mb-2 text-sm font-semibold text-foreground">{source.label} · Spotify</h2>
      <div className="relative h-[352px] overflow-hidden rounded-xl bg-muted">
        {loading && (
          <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={18} className="animate-spin" /> Loading Spotify…
          </div>
        )}
        <iframe
          title={`Spotify player — ${source.label}`}
          src={`https://open.spotify.com/embed/${source.type}/${source.id}?utm_source=generator`}
          width="100%"
          height="352"
          className="relative h-full w-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Press Play inside the player. Spotify may limit playback to previews depending on your account and browser.
      </p>
    </section>
  );
}