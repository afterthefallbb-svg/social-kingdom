import React from "react";
import { Music as MusicIcon, Play } from "lucide-react";

export default function MusicGenres({ genres, source, onSelect }) {
  return (
    <section className="mt-6" aria-label="Music genres">
      <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold text-foreground">
        <MusicIcon size={15} /> Pick a genre
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {genres.map((genre) => {
          const selected = source.type === "playlist" && source.id === genre.id;
          return (
            <button
              key={genre.id} type="button" aria-pressed={selected}
              onClick={() => onSelect({ ...genre, type: "playlist" })}
              className={`inline-flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold ${selected ? "bg-brand text-brand-foreground" : "bg-muted text-foreground"}`}
            >
              {genre.label} <Play size={14} className={selected ? "text-brand-foreground" : "text-brand"} />
            </button>
          );
        })}
      </div>
    </section>
  );
}