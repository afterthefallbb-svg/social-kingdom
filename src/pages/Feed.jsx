import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PhotoComposer from "@/components/compose/PhotoComposer";
import PostCard from "@/components/profile/PostCard";
import FeedPhotoNotice from "@/components/feed/FeedPhotoNotice";
import FeedVideos from "@/components/feed/FeedVideos";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

export default function Feed() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [zoom, setZoom] = useState(null);
  const [authorIds, setAuthorIds] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const u = await base44.auth.me().catch(() => null);
      setMe(u);

      // Friends (accepted) of the current user — the feed shows their posts + yours.
      let friendIds = [];
      if (u) {
        try {
          const fr = await base44.entities.Friendship.filter(
            { user_id: u.id, status: "accepted" },
            { limit: 500 }
          );
          friendIds = fr.items.map((f) => f.friend_id).filter(Boolean);
        } catch {
          /* ignore */
        }
      }
      const authorIds = u ? [u.id, ...friendIds] : [];
      setAuthorIds(authorIds);
      const res = authorIds.length
        ? await base44.entities.Post.filter(
            { author_id: { $in: authorIds } },
            { sort: "-created_date", limit: 50 }
          )
        : await base44.entities.Post.filter({}, { sort: "-created_date", limit: 50 });
      setPosts(res.items || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 px-3 py-3">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#000000" }}>
            <ChevronLeft size={22} /> Back
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">Feed</h1>
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            aria-label="Add post"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm"
            style={{ background: FB }}
          >
            <Plus size={22} />
          </button>
          <button type="button" onClick={load} aria-label="Refresh" className="p-1" style={{ color: FB }}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 pt-3 space-y-3">
        {/* Compose entry (collapsed prompt) + full photo composer when opened */}
        {me && (
          <>
            {!composeOpen && <PhotoComposer me={me} onPosted={load} />}
            {composeOpen && (
              <PhotoComposer
                me={me}
                onPosted={load}
                open={composeOpen}
                onOpenChange={setComposeOpen}
              />
            )}
          </>
        )}

        {authorIds.length > 0 && <FeedVideos authorIds={authorIds} />}

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Nothing in your feed yet. Tap the + to add a post, or make some friends to see their updates here.
          </div>
        )}

        {!loading && posts.map((p) =>
          p.content && p.content.trim() ? (
            <PostCard key={p.id} post={p} />
          ) : p.image_url ? (
            <FeedPhotoNotice key={p.id} post={p} onOpen={(post) => setZoom(post.image_url)} />
          ) : null
        )}
      </div>

      {/* Full-image viewer */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          <Image src={zoom} fittingType="fit" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}