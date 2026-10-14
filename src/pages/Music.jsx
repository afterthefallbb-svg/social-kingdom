import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Play, ExternalLink } from "lucide-react";

const FB = "#1877f2";

// Verified-embeddable YouTube music videos, used as seeds for endless genre mixes.
const GENRES = [
  { label: "Pop", id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You" },
  { label: "Hip-hop", id: "tvTRZJ-4EyI", title: "Kendrick Lamar - HUMBLE." },
  { label: "R&B", id: "4NRXx6U8ABQ", title: "The Weeknd - Blinding Lights" },
  { label: "Rock", id: "hTWKbfoikeg", title: "Nirvana - Smells Like Teen Spirit" },
  { label: "Latin", id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito" },
  { label: "Country", id: "r7qovpFAGrQ", title: "Lil Nas X - Old Town Road" },
  { label: "Funk", id: "OPf0YbXqDm0", title: "Mark Ronson - Uptown Funk" },
  { label: "K-pop", id: "9bZkp7q19f0", title: "PSY - Gangnam Style" },
  { label: "Alt", id: "DyDfgMOUjCI", title: "Billie Eilish - bad guy" },
  { label: "Throwback", id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again" }
];

function parseVideoId(input) {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default function Music() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(GENRES[0]);
  const [input, setInput] = useState("");

  const src = `https://www.youtube.com/embed/${current.id}?list=RD${current.id}&autoplay=1&mute=1&rel=0`;

  function playInput() {
    const id = parseVideoId(input);
    if (id) {
      setCurrent({ id, title: "Your selection" });
      setInput("");
    } else if (input.trim()) {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(input.trim())}`, "_blank");
    }
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Music</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      {/* Embedded in-app YouTube player */}
      <div className="px-4 mt-5">
        <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            key={current.id}
            src={src}
            title={current.title}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-800 truncate">{current.title}</p>
        <p className="text-[11px] text-gray-400">Playing a YouTube mix in-app — tap the player to unmute</p>
      </div>

      {/* Paste a link or video ID to play in-app */}
      <div className="px-4 mt-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") playInput();
              }}
              placeholder="Paste a YouTube link or video ID to play"
              className="w-full pl-9 pr-3 h-11 rounded-full bg-gray-100 text-sm outline-none"
            />
          </div>
          <button
            onClick={playInput}
            className="shrink-0 inline-flex items-center gap-1 rounded-full px-4 text-sm font-semibold text-white"
            style={{ background: FB }}
          >
            <Play size={15} /> Play
          </button>
        </div>
        <button
          onClick={() => input.trim() && window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(input.trim())}`, "_blank")}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: FB }}
        >
          <ExternalLink size={12} /> Type a song or artist name to search YouTube
        </button>
      </div>

      {/* Genre mixes */}
      <div className="px-4 mt-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">Pick a genre — plays a mix</p>
        <div className="grid grid-cols-2 gap-2">
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => setCurrent(g)}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-left"
              style={{
                background: current.id === g.id ? FB : "#eef2f7",
                color: current.id === g.id ? "#fff" : "#1f2937"
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}