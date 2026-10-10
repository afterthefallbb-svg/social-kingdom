import React from "react";
import { Image } from "@/components/ui/image";

// A single browse category row: heading with an underline (clickable to open
// the full category page) and a horizontally scrollable strip of circles.
export default function CategoryRow({ title, onTitle, items = [], emptyText = "Nothing here yet." }) {
  return (
    <div className="px-4">
      <button onClick={onTitle} className="mb-1.5">
        <span className="font-bold text-gray-900 text-base">{title}</span>
      </button>
      <div className="h-[3px] w-12 bg-gray-900 mb-3 rounded-full" />
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">{emptyText}</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={it.onClick}
              className="flex flex-col items-center gap-1 shrink-0 w-16"
            >
              <span className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-2xl bg-gray-100">
                {it.image ? (
                  <Image src={it.image} fittingType="fill" className="w-full h-full" />
                ) : (
                  it.emoji || "•"
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