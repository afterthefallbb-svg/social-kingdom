import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Play, Video as VideoIcon, Trash2 } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoComposer from "@/components/video/VideoComposer";
import VideoCreateButton from "@/components/video/VideoCreateButton";

const FB = "#1877f2";

// Reusable grid of videos belonging to a page (event, click, or profile).
// `scope` is one of: { event_id }, { click_id }, { user_id }.
// The create button opens the composer pre-scoped so the new video is posted
// to this page (and to the creator's profile).
export default function VideoGallery({ title = "Videos", scope, createCategory }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerState, setPlayerState] = useState(null);
  const [composing, setComposing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  async function remove(v) {
    if (!window.confirm("Delete this video? This cannot be undone.")) return;
    try {
      await base44.entities.Video.delete(v.id);
      setReloadKey((k) => k + 1);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res = await base44.entities.Video.filter(
          scope,
          { sort: "-created_date", limit: 100 }
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
  }, [JSON.stringify(scope), reloadKey]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
          <VideoIcon size={16} style={{ color: FB }} /> {title}
        </h3>
        <VideoCreateButton onClick={() => setComposing(true)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <p className="text-xs text-gray-400">No videos yet. Tap Create to add one.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {videos.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setPlayerState({ videos, index: i })}
              className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-100"
            >
              {v.thumbnail ? (
                <Image src={v.thumbnail} fittingType="fill" className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play size={18} className="text-white fill-white" />
              </span>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1">
                <p className="text-[10px] text-white font-medium truncate">
                  {v.caption || v.user_name || "Video"}
                </p>
              </div>
              {me && v.user_id === me.id && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); remove(v); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); remove(v); } }}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
                  aria-label="Delete video"
                >
                  <Trash2 size={13} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {playerState && (
        <VideoPlayer
          videos={playerState.videos}
          startIndex={playerState.index}
          onClose={() => setPlayerState(null)}
        />
      )}
      {composing && (
        <VideoComposer
          category={createCategory}
          eventId={scope.event_id}
          clickId={scope.click_id}
          onCreated={() => { setComposing(false); setReloadKey((k) => k + 1); }}
          onClose={() => setComposing(false)}
        />
      )}
    </div>
  );
}