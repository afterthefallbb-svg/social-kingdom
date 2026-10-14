import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Play } from "lucide-react";

const FB = "#1877f2";

const GENRES = [
  { label: "Hip-hop", q: "hip hop mix" },
  { label: "R&B", q: "r&b playlist" },
  { label: "Jazz", q: "jazz" },
  { label: "Indie", q: "indie" },
  { label: "Country", q: "country" },
  { label: "Rock", q: "rock" },
  { label: "Pop", q: "pop hits" },
  { label: "Reggae", q: "reggae" },
  { label: "Latin", q: "latin music" },
  { label: "Classical", q: "classical music" },
  { label: "Lo-fi", q: "lofi study" },
  { label: "Workout", q: "workout music" },
];

function ytSearch(q) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export default function Music() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Music</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <div className="px-4 mt-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim()) window.open(ytSearch(q.trim()), "_blank");
            }}
            placeholder="Search YouTube for any song or artist"
            className="w-full pl-10 pr-3 h-12 rounded-full bg-gray-100 text-sm outline-none"
          />
        </div>
        <button
          onClick={() => q.trim() && window.open(ytSearch(q.trim()), "_blank")}
          className="mt-3 w-full rounded-full py-2.5 text-white font-semibold inline-flex items-center justify-center gap-1.5"
          style={{ background: FB }}
        >
          <Play size={15} /> Search on YouTube
        </button>
      </div>

      <div className="px-4 mt-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">Browse by genre</p>
        <div className="grid grid-cols-2 gap-2">
          {GENRES.map((g) => (
            <button
              key={g.label}
              onClick={() => window.open(ytSearch(g.q), "_blank")}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-white"
              style={{ background: FB }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-6">
        <button
          onClick={() => window.open("https://www.youtube.com", "_blank")}
          className="w-full rounded-xl py-3 text-sm font-semibold border"
          style={{ borderColor: FB, color: FB }}
        >
          Open YouTube
        </button>
      </div>
    </div>
  );
}