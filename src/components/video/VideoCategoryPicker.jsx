import React, { useRef } from "react";
import { STREAM_CATEGORIES } from "@/lib/streamCategories";
import { Tag, ChevronDown } from "lucide-react";

const FB = "#1877f2";

// Scrollable category selector used inside the video composer. Uses the same
// categories as the streaming section so a video created under "Products" lands
// in the Products category, etc.
export default function VideoCategoryPicker({ value, onChange }) {
  const scrollRef = useRef(null);

  const cats = STREAM_CATEGORIES.map((c) => c.name);

  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1">
        <Tag size={12} /> Category
      </p>
      <div className="flex items-center gap-2">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar flex-1 pb-1"
          style={{ scrollSnapType: "x proximity" }}
        >
          {cats.map((c) => {
            const active = value === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange(c)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap"
                style={{
                  scrollSnapAlign: "start",
                  background: active ? FB : "#f3f4f6",
                  color: active ? "#fff" : "#374151",
                  borderColor: active ? FB : "#e5e7eb",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}