import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Play, Video as VideoIcon } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";

const FB = "#1877f2";

// Horizontal strip of videos posted by the current user and their friends.
// Videos created from the streaming section (or anywhere) appear here so
// friends can discover and play them.
export default function FeedVideos({ authorIds }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerState, setPlayerState] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const ids = authorIds && authorIds.length ? authorIds : null;
        const q = ids ? { user_id: { $in: ids } } : {};
        const res = await base44.entities.Video.filter(q, { sort: "-created_date", limit: 30 });
        if (!active) return;
        setVideos(res.items || []);
      } catch {
        setVideos([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [JSON.stringify(authorIds)]);

  if (loading || videos.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-2">
        <VideoIcon size={15} style={{ color: FB }} /> Videos from friends
      </h3>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {videos.map((v, i) => (
          <button
            key={v.id}
            onClick={() => setPlayerState({ videos, index: i })}
            className="relative w-20 aspect-[9/16] rounded-lg overflow-hidden bg-gray-100 shrink-0"
          >
            {v.thumbnail ? (
              <Image src={v.thumbnail} fittingType="fill" className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play size={16} className="text-white fill-white" />
            </span>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5">
              <p className="text-[9px] text-white font-medium truncate">{v.user_name?.split(" ")[0]}</p>
            </div>
          </button>
        ))}
      </div>

      {playerState && (
        <VideoPlayer
          videos={playerState.videos}
          startIndex={playerState.index}
          onClose={() => setPlayerState(null)}
        />
      )}
    </div>
  );
}