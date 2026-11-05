import React from "react";
import { Image } from "@/components/ui/sk-image";
import { Play } from "lucide-react";

const FB = "#1877f2";

// One genre row: bold genre title + a horizontal strip of game bubbles that
// scroll right-to-left. Bubbles are fixed-width so nothing hangs off the edge.
export default function GameRow({ genre, onPlay }) {
  const games = genre.games || [];
  if (games.length === 0) return null;

  return (
    <div className="px-3">
      <h3 className="font-bold text-base mb-1.5 flex items-center gap-1.5" style={{ color: "#000000" }}>
        <span>{genre.emoji}</span>
        <span>{genre.name}</span>
      </h3>
      <div className="flex overflow-x-auto no-scrollbar gap-2.5 pb-1">
        {games.map((g) => (
          <button
            key={g.title + g.embed}
            onClick={() => onPlay(g)}
            className="flex flex-col items-center shrink-0 w-[74px]"
          >
            <span className="relative w-[74px] h-[74px] rounded-xl overflow-hidden bg-gray-100 shadow-sm">
              {g.image ? (
                <Image src={g.image} fittingType="fill" className="w-full h-full" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-2xl">🎮</span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                <Play size={18} className="text-white fill-white" />
              </span>
            </span>
            <span className="text-[10px] text-gray-700 text-center leading-tight line-clamp-2 w-full mt-1 min-h-[26px]">
              {g.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}