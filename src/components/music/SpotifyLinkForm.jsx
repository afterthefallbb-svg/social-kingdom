import React, { useState } from "react";
import { Link2, Play } from "lucide-react";

export default function SpotifyLinkForm({ onLoadSource }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const value = link.trim().replace(/^spotify:(track|album|artist|playlist):([A-Za-z0-9]{22})$/, "https://open.spotify.com/$1/$2");
      const url = new URL(value);
      const match = url.pathname.match(/^\/(?:intl-[a-z-]+\/)?(?:embed\/)?(track|album|artist|playlist)\/([A-Za-z0-9]{22})\/?$/i);
      if (url.protocol !== "https:" || url.hostname !== "open.spotify.com" || !match) throw new Error("Invalid Spotify link");
      onLoadSource({ type: match[1].toLowerCase(), id: match[2], label: "Your Spotify selection" });
    } catch {
      setError("Paste a Spotify song, album, artist, or playlist link from Spotify’s Share menu.");
    }
  }
  return (
    <form onSubmit={submit} className="mt-4">
      <label htmlFor="spotify-link" className="mb-1.5 block text-sm font-medium text-foreground">Spotify link</label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="spotify-link" value={link} required maxLength={2048}
            onChange={(event) => { setLink(event.target.value); setError(""); }}
            placeholder="Paste a Spotify song or playlist link"
            aria-invalid={Boolean(error)} aria-describedby={error ? "spotify-link-error" : undefined}
            className="h-11 w-full rounded-full bg-muted pl-9 pr-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </div>
        <button type="submit" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground">
          <Play size={15} /> Load
        </button>
      </div>
      {error && <p id="spotify-link-error" role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </form>
  );
}