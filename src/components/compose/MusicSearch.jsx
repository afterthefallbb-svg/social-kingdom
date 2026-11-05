import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Music2, Play, Pause, X, Check } from "lucide-react";
import { Image } from "@/components/ui/sk-image";

const FB = "#1877f2";

export default function MusicSearch({ selected, onSelect }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [audio, setAudio] = useState(null);
  const [error, setError] = useState("");

  function stop() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlayingId(null);
  }

  function toggle(t) {
    if (playingId === t.trackId) {
      stop();
      return;
    }
    if (audio) audio.pause();
    const a = new Audio(t.previewUrl);
    a.play().catch(() => {});
    a.onended = () => setPlayingId(null);
    setAudio(a);
    setPlayingId(t.trackId);
  }

  async function search(e) {
    e.preventDefault();
    if (!term.trim()) return;
    stop();
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("searchMusic", { term });
      const data = res.data || res || {};
      setResults(data.results || []);
      if (!(data.results || []).length) setError("No tracks found. Try another search.");
    } catch (err) {
      setResults([]);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <form onSubmit={search} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search songs, artists…"
            className="w-full text-sm border rounded-lg pl-8 pr-3 py-2 outline-none"
          />
        </div>
        <button
          type="submit"
          className="text-sm font-semibold text-white px-3 rounded-lg"
          style={{ background: FB }}
        >
          {loading ? "…" : "Find"}
        </button>
      </form>

      {selected && (
        <div className="mt-2 flex items-center gap-2 bg-blue-50 rounded-lg p-2">
          {selected.artworkUrl && (
            <div className="w-9 h-9 rounded overflow-hidden shrink-0">
              <Image src={selected.artworkUrl} fittingType="fill" className="w-full h-full" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: FB }}>{selected.trackName}</p>
            <p className="text-[11px] text-gray-500 truncate">{selected.artistName}</p>
          </div>
          <span className="text-[10px] text-gray-400">30s clip</span>
          <button onClick={() => { stop(); onSelect(null); }} className="p-1 text-gray-400">
            <X size={14} />
          </button>
        </div>
      )}

      {!selected && results.length > 0 && (
        <div className="mt-2 max-h-48 overflow-y-auto no-scrollbar space-y-1">
          {results.map((t) => (
            <button
              key={t.trackId}
              onClick={() => { stop(); onSelect(t); }}
              className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 text-left"
            >
              <span
                onClick={(e) => { e.stopPropagation(); toggle(t); }}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: FB + "18", color: FB }}
              >
                {playingId === t.trackId ? <Pause size={14} /> : <Play size={14} />}
              </span>
              {t.artworkUrl && (
                <div className="w-9 h-9 rounded overflow-hidden shrink-0">
                  <Image src={t.artworkUrl} fittingType="fill" className="w-full h-full" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-gray-800">{t.trackName}</p>
                <p className="text-[11px] text-gray-500 truncate">{t.artistName}</p>
              </div>
              <Check size={15} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {!selected && !loading && results.length === 0 && !error && (
        <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
          <Music2 size={12} /> Search to add a 30-second song clip behind your video.
        </p>
      )}

      {!selected && !loading && error && (
        <p className="text-[11px] text-red-400 mt-2 flex items-center gap-1">
          <Music2 size={12} /> {error}
        </p>
      )}
    </div>
  );
}