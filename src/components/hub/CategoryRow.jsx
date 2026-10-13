import React from "react";
import { Image } from "@/components/ui/image";
import { Play } from "lucide-react";

const FB = "#1877f2";

// A single browse category row: centered blue heading (no underline, clickable
// to open the full category page) and a horizontally scrollable strip of circles.
export default function CategoryRow({ title, onTitle, items = [], emptyText = "Nothing here yet." }) {
  return (
    <div className="px-4 text-center">
      <button onClick={onTitle} className="mb-3">
        <span className="font-bold text-base" style={{ color: FB }}>{title}</span>
      </button>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">{emptyText}</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar justify-start pb-1">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={it.onClick}
              className="flex flex-col items-center gap-1 shrink-0 w-16"
            >
              <span className="relative w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-2xl bg-gray-100">
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
                <span className="text-[10px] text-gray-600 text-center leading-tight truncate w-full">
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