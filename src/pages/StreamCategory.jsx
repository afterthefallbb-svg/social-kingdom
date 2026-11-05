import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/sk-image";
import { Play } from "lucide-react";
import CategoryPageHeader from "@/components/category/CategoryPageHeader";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoComposer from "@/components/video/VideoComposer";
import VideoCreateButton from "@/components/video/VideoCreateButton";

// Browse all videos within one streaming category. A search box at the top
// filters videos by caption / creator name within the category.
export default function StreamCategory() {
  const params = new URLSearchParams(window.location.search);
  const categoryName = params.get("name") || "all other";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [playerState, setPlayerState] = useState(null);
  const [composing, setComposing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res = await base44.entities.Video.filter(
          { category: categoryName },
          { sort: "-created_date", limit: 200 }
        );
        if (!active) return;
        setVideos(res.items || []);
      } catch {
        setVideos([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [categoryName, reloadKey]);

  const filtered = query.trim()
    ? videos.filter((v) => {
        const q = query.toLowerCase();
        return (
          (v.caption || "").toLowerCase().includes(q) ||
          (v.user_name || "").toLowerCase().includes(q)
        );
      })
    : videos;

  return (
    <div className="min-h-screen bg-white pb-28">
      <CategoryPageHeader title={categoryName} backTo="/stream">
        <VideoCreateButton onClick={() => setComposing(true)} />
      </CategoryPageHeader>

      {/* Search box */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search videos in ${categoryName}…`}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            {query ? "No videos match your search." : "No videos in this category yet."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setPlayerState({ videos: filtered, index: i })}
                className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-100 group"
              >
                {v.thumbnail ? (
                  <Image src={v.thumbnail} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play size={20} className="text-white fill-white" />
                </span>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1">
                  <p className="text-[10px] text-white font-medium truncate">
                    {v.caption || v.user_name || "Video"}
                  </p>
                </div>
              </button>
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
          category={categoryName}
          onCreated={() => { setComposing(false); setReloadKey((k) => k + 1); }}
          onClose={() => setComposing(false)}
        />
      )}
    </div>
  );
}