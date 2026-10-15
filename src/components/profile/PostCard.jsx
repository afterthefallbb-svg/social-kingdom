import React, { useState } from "react";
import { Share, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import KloutButton from "@/components/klout/KloutButton";
import CommentSection from "@/components/comments/CommentSection";

const FB = "#1877f2";

function MusicBar({ post }) {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  if (!post.music_url) return null;

  function toggle() {
    if (playing) {
      audio?.pause();
      setPlaying(false);
      return;
    }
    const a = new Audio(post.music_url);
    a.play().catch(() => {});
    a.onended = () => setPlaying(false);
    setAudio(a);
    setPlaying(true);
  }

  return (
    <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-lg p-2">
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
        style={{ background: FB }}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      {post.music_artwork && (
        <div className="w-9 h-9 rounded overflow-hidden shrink-0">
          <Image src={post.music_artwork} fittingType="fill" className="w-full h-full" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate text-gray-800">{post.music_title}</p>
        <p className="text-[11px] text-gray-500 truncate">{post.music_artist}</p>
      </div>
    </div>
  );
}

export default function PostCard({ post, me, onDeleted }) {
  const time = post.created_date ? new Date(post.created_date).toLocaleString() : "";
  const initial = (post.author_name || "?").charAt(0).toUpperCase();
  const canDelete = !!me && post.author_id === me.id;

  async function share() {
    try {
      await navigator.share?.({ title: post.author_name || "Post", text: post.content || "" });
    } catch {
      /* ignore */
    }
  }

  async function del() {
    if (!canDelete) return;
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await base44.entities.Post.delete(post.id);
      onDeleted?.(post);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3">
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center font-bold shrink-0"
          style={{ color: FB }}
        >
          {post.author_avatar ? (
            <Image src={post.author_avatar} fittingType="fill" className="w-full h-full" />
          ) : (
            initial
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{post.author_name}</p>
          <p className="text-[11px] text-gray-400">{time}</p>
        </div>
        {canDelete && (
          <button
            onClick={del}
            className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
            aria-label="Delete post"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {post.content && (
        <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{post.content}</p>
      )}
      {post.image_url && (
        <div className="mt-2 rounded-xl overflow-hidden border border-gray-100">
          <Image src={post.image_url} fittingType="fill" className="w-full h-52" />
        </div>
      )}
      <MusicBar post={post} />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <KloutButton target_type="post" target_id={post.id} size="sm" />
        <div className="flex items-center gap-4">
          <CommentSection postId={post.id} />
          <button
            onClick={share}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500"
            aria-label="Share"
          >
            <Share size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}