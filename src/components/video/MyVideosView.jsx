import React, { useEffect, useState } from "react";
import { ChevronLeft, Bookmark, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import VideoPlayer from "./VideoPlayer";

// Full-screen view of videos the current user has saved while watching.
// Saved snapshots are reconstructed into video-like objects so the player
// can play them directly without a second fetch.
export default function MyVideosView({ onClose }) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerState, setPlayerState] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        const res = await base44.entities.SavedVideo.filter(
          { user_id: me.id },
          { sort: "-created_date", limit: 200 }
        );
        if (!active) return;
        setSaved(res.items || []);
      } catch {
        setSaved([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const videos = saved.map((s) => ({
    id: s.video_id,
    url: s.url,
    thumbnail: s.thumbnail,
    caption: s.caption,
    user_name: s.video_user_name,
    user_avatar: s.video_user_avatar,
    music_url: s.music_url,
    music_title: s.music_title,
    music_artist: s.music_artist,
    music_artwork: s.music_artwork,
  }));

  return (
    <div className="fixed inset-0 z-[950] bg-white flex flex-col">
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm font-semibold"
          style={{ color: "#000000" }}
          aria-label="Back"
        >
          <ChevronLeft size={22} /> Back
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">My Videos</h1>
        <span className="w-9" />
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-6 text-center">
          <Bookmark size={40} className="mb-3" />
          <p className="text-sm">
            No saved videos yet. While watching a video, tap Save to add it here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-3">
            {videos.map((v, i) => (
              <button
                key={v.id || i}
                onClick={() => setPlayerState({ index: i })}
                className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100"
              >
                {v.thumbnail ? (
                  <Image src={v.thumbnail} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play size={26} className="text-white fill-white" />
                </span>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                  <p className="text-xs text-white font-medium truncate">
                    {v.caption || v.user_name || "Saved video"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {playerState && (
        <VideoPlayer
          videos={videos}
          startIndex={playerState.index}
          onClose={() => setPlayerState(null)}
        />
      )}
    </div>
  );
}