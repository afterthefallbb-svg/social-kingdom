import React, { useState } from "react";
import { ThumbsUp, MessageCircle, Share, Play, Pause, Music2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

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
        {playing ? <Pause size={14} /> : <Play size={14} />}
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
      <Music2 size={14} className="text-gray-300 shrink-0" />
    </div>
  );
}

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);

  async function like() {
    if (liked) return;
    setLiked(true);
    const n = likes + 1;
    setLikes(n);
    try {
      await base44.entities.Post.update(post.id, { likes: n });
    } catch {
      /* non-blocking */
    }
  }

  const time = post.created_date ? new Date(post.created_date).toLocaleString() : "";
  const initial = (post.author_name || "?").charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center font-bold shrink-0" style={{ color: FB }}>
          {post.author_avatar ? (
            <Image src={post.author_avatar} fittingType="fill" className="w-full h-full" />
          ) : (
            initial
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{post.author_name}</p>
          <p className="text-[11px] text-gray-400">{time}</p>
        </div>
      </div>
      {post.content && <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{post.content}</p>}
      {post.image_url && (
        <div className="mt-2 rounded-xl overflow-hidden border border-gray-100">
          <Image src={post.image_url} fittingType="fill" className="w-full h-52" />
        </div>
      )}
      <MusicBar post={post} />
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <button
          onClick={like}
          className="flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: liked ? FB : "#6b7280" }}
        >
          <ThumbsUp size={16} fill={liked ? FB : "none"} /> {likes}
        </button>
        <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
          <MessageCircle size={16} /> 0
        </button>
        <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
          <Share size={16} />
        </button>
      </div>
    </div>
  );
}