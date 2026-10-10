import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

const TITLES = {
  events: "Events",
  videos: "Stream",
  artists: "Artist's",
  cliqs: "Cliq's",
  music: "Music",
  shop: "Shop-online",
  "local-sale": "Local Sale",
};

const SUPPORTED = ["events", "videos", "cliqs"];

export default function CategoryBrowse() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      let its = [];
      try {
        if (category === "events") {
          const res = await base44.entities.Event.filter(
            { visibility: { $ne: "personal" } },
            { sort: "-created_date", limit: 100 }
          );
          its = res.items.map((e) => ({
            id: e.id,
            label: e.title,
            image: e.image_url,
            emoji: getCategory(e.category).emoji,
            onClick: () => navigate(`/event/${e.id}`),
          }));
        } else if (category === "videos") {
          const res = await base44.entities.EventPhoto.filter(
            { type: "video" },
            { sort: "-created_date", limit: 100 }
          );
          its = res.items.map((v) => ({
            id: v.id,
            label: v.user_name,
            image: v.url,
            emoji: "🎬",
            onClick: () => (v.event_id ? navigate(`/event/${v.event_id}`) : null),
          }));
        } else if (category === "cliqs") {
          const res = await base44.entities.Click.filter({}, { sort: "-member_count", limit: 100 });
          its = res.items.map((c) => ({
            id: c.id,
            label: c.name,
            image: c.avatar_url,
            emoji: "👥",
            onClick: () => navigate(`/clicks/${c.id}`),
          }));
        }
      } catch {
        its = [];
      }
      if (active) {
        setItems(its);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [category]);

  const title = TITLES[category] || "Browse";
  const hasData = SUPPORTED.includes(category);

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">{title}</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <div className="px-4 mt-4">
        {loading ? (
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        ) : !hasData ? (
          <p className="text-sm text-gray-400">Coming soon.</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing here yet.</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={it.onClick}
                className="flex flex-col items-center gap-1"
              >
                <span className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-2xl bg-gray-100">
                  {it.image ? (
                    <Image src={it.image} fittingType="fill" className="w-full h-full" />
                  ) : (
                    it.emoji
                  )}
                </span>
                <span className="text-[10px] text-gray-600 text-center leading-tight truncate w-full">
                  {it.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}