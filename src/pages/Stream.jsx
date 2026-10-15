import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bookmark } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CategoryRow from "@/components/hub/CategoryRow";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoComposer from "@/components/video/VideoComposer";
import VideoCreateButton from "@/components/video/VideoCreateButton";
import MyVideosView from "@/components/video/MyVideosView";
import { STREAM_CATEGORIES } from "@/lib/streamCategories";

const FB = "#1877f2";

// Streaming hub: each category shows real user videos. Tapping a video opens
// the full-screen player; the Create button opens the video composer.
export default function Stream() {
  const navigate = useNavigate();
  const [videosByCat, setVideosByCat] = useState({});
  const [loading, setLoading] = useState(true);
  const [playerState, setPlayerState] = useState(null);
  const [composing, setComposing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [myVideosOpen, setMyVideosOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res = await base44.entities.Video.filter({}, { sort: "-created_date", limit: 100 });
        if (!active) return;
        const grouped = {};
        (res.items || []).forEach((v) => {
          const cat = v.category || "all other";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(v);
        });
        setVideosByCat(grouped);
      } catch {
        setVideosByCat({});
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [reloadKey]);

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Stream</span>
        <div className="ml-auto">
          <VideoCreateButton onClick={() => setComposing(true)} />
        </div>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <div className="px-4 mt-3">
        <button
          onClick={() => setMyVideosOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold"
          style={{ borderColor: FB, color: FB }}
        >
          <Bookmark size={16} /> My Videos
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {STREAM_CATEGORIES.map((c) => {
          const catVideos = videosByCat[c.name] || [];
          const items = [
            ...catVideos.map((v) => ({
              id: v.id,
              label: v.caption || v.user_name || "Video",
              image: v.thumbnail,
              emoji: "🎬",
              isVideo: true,
            })),
            ...c.items.slice(0, Math.max(0, 10 - catVideos.length)).map((s, i) => ({
              ...s,
              id: `sample-${c.name}-${i}`,
              isVideo: false,
            })),
          ];
          return (
            <CategoryRow
              key={c.name}
              title={c.name}
              items={items}
              emptyText="No videos yet."
              onTitle={() => navigate(`/stream/category?name=${encodeURIComponent(c.name)}`)}
              onVideoClick={(idx) => setPlayerState({ videos: catVideos, index: idx })}
            />
          );
        })}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {playerState && (
        <VideoPlayer videos={playerState.videos} startIndex={playerState.index} onClose={() => setPlayerState(null)} />
      )}
      {myVideosOpen && <MyVideosView onClose={() => setMyVideosOpen(false)} />}
      {composing && (
        <VideoComposer
          onCreated={() => { setComposing(false); setReloadKey((k) => k + 1); }}
          onClose={() => setComposing(false)}
        />
      )}
    </div>
  );
}