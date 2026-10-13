import React from "react";
import { Image } from "@/components/ui/image";
import { Play } from "lucide-react";

const FB = "#1877f2";

// A single browse category row: centered blue heading (no underline, clickable
// to open the full category page) and a horizontally scrollable strip of circles.
export default function CategoryRow({ title, onTitle, items = [], emptyText = "Nothing here yet." }) {
  return (
    <div className="px-4 text-center">
      <button onClick={onTitle} className="mb-1">
        <span className="font-bold text-lg" style={{ color: FB }}>{title}</span>
      </button>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={it.onClick}
              className="flex flex-col items-center gap-1 shrink-0 w-1/4 px-1.5 snap-start"
            >
              <span className="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-2xl bg-gray-100">
                {it.image ? (
                  <Image src={it.image} fittingType="fill" className="w-full h-full" />
                ) : (
                  it.emoji || "•"
                )}
                {it.isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play size={16} className="text-white fill-white" />
                  </span>
                )}
              </span>
              {it.label && (
                <span className="text-sm text-gray-700 text-center leading-tight break-words w-full">
                  {it.label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}