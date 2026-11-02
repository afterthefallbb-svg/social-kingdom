import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import CategoryPageHeader from "@/components/category/CategoryPageHeader";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoComposer from "@/components/video/VideoComposer";
import VideoCreateButton from "@/components/video/VideoCreateButton";
import HubCard from "@/components/hub/HubCard";

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
  const [playerState, setPlayerState] = useState(null);
  const [composing, setComposing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
            meta: e.start_time ? moment(e.start_time).format("MMM D · h:mm A") : e.address || "View event",
            onClick: () => navigate(`/event/${e.id}`),
          }));
        } else if (category === "videos") {
          const res = await base44.entities.Video.filter(
            {},
            { sort: "-created_date", limit: 100 }
          );
          const vids = res.items;
          its = vids.map((v, i) => ({
            id: v.id,
            label: v.caption || v.user_name || "Video",
            image: v.thumbnail,
            emoji: "🎬",
            isVideo: true,
            author: v.user_name,
            avatar: v.user_avatar,
            time: v.created_date ? moment(v.created_date).fromNow() : "",
            onClick: () => setPlayerState({ videos: vids, index: i }),
          }));
        } else if (category === "cliqs") {
          const res = await base44.entities.Click.filter({}, { sort: "-member_count", limit: 100 });
          its = res.items.map((c) => ({
            id: c.id,
            label: c.name,
            image: c.avatar_url,
            emoji: "👥",
            meta: `${(c.member_count || 0).toLocaleString()} members`,
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
  }, [category, reloadKey]);

  const title = TITLES[category] || "Browse";
  const hasData = SUPPORTED.includes(category);

  return (
    <div className="min-h-screen bg-white pb-32">
      <CategoryPageHeader title={title} backTo="/browse">
        {category === "videos" && <VideoCreateButton onClick={() => setComposing(true)} />}
      </CategoryPageHeader>

      <div className="px-4 mt-4">
        {loading ? (
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        ) : !hasData ? (
          <p className="text-sm text-gray-400">Coming soon.</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing here yet.</p>
        ) : (
          <div className="kingdom-grid">
            {items.map((it) => (
              <HubCard key={it.id} item={it} stream={category === "videos"} onClick={it.onClick} />
            ))}
          </div>
        )}
      </div>

      {playerState && (
        <VideoPlayer
          videos={playerState.videos}
          startIndex={playerState.index}
          onClose={() => setPlayerState(null)}
        />
      )}
      {composing && (
        <VideoComposer
          category={category}
          onCreated={() => { setComposing(false); setReloadKey((k) => k + 1); }}
          onClose={() => setComposing(false)}
        />
      )}
    </div>
  );
}