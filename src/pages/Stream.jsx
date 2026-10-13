import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import CategoryRow from "@/components/hub/CategoryRow";
import { STREAM_CATEGORIES } from "@/lib/streamCategories";

const FB = "#1877f2";

// Streaming hub: each whiteboard category as a heading with a row of bubbles.
export default function Stream() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Stream</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <div className="mt-6 space-y-5">
        {STREAM_CATEGORIES.map((c) => (
          <CategoryRow
            key={c.name}
            title={c.name}
            items={c.items}
            emptyText="Nothing here yet."
          />
        ))}
      </div>
    </div>
  );
}