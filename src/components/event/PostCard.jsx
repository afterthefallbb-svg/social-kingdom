import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";

const FB = "#1877f2";

export default function PostCard({ post, onLike }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [me, setMe] = useState(null);
  const [text, setText] = useState("");

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    if (!showComments) return;
    base44.entities.Comment.filter({ post_id: post.id }, { sort: "created_date", limit: 100 })
      .then((p) => setComments(p.items))
      .catch(() => {});
  }, [showComments, post.id]);

  async function addComment() {
    if (!text.trim() || !me) return;
    try {
      const c = await base44.entities.Comment.create({
        post_id: post.id,
        user_id: me.id,
        user_name: me.full_name,
        user_avatar: me.avatar_url,
        content: text.trim()
      });
      setComments([...comments, c]);
      setText("");
    } catch (e) {
      /* ignore */
    }
  }

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "#eef0f3" }}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/profile/${post.author_id}`)}
          className="w-9 h-9 rounded-full overflow-hidden border flex items-center justify-center text-sm font-bold"
          style={{ borderColor: FB, background: FB + "22", color: FB }}
        >
          {post.author_avatar ? (
            <Image src={post.author_avatar} fittingType="fill" className="w-full h-full" />
          ) : (
            (post.author_name || "?").charAt(0)
          )}
        </button>
        <button
          onClick={() => navigate(`/profile/${post.author_id}`)}
          className="text-sm font-semibold text-gray-800"
        >
          {post.author_name}
        </button>
      </div>

      {post.content && <p className="text-sm text-gray-700 mt-2">{post.content}</p>}
      {post.image_url && <Image src={post.image_url} fittingType="fill" className="w-full h-48 rounded-lg mt-2" />}

      <div className="flex items-center gap-4 mt-2">
        <button onClick={() => onLike(post)} className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Heart size={14} /> {post.likes || 0}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="inline-flex items-center gap-1 text-xs text-gray-500"
        >
          <MessageCircle size={14} /> Comment
        </button>
      </div>

      {showComments && (
        <div className="mt-2 space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <span
                className="w-7 h-7 rounded-full overflow-hidden border flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ borderColor: FB, background: FB + "22", color: FB }}
              >
                {c.user_avatar ? (
                  <Image src={c.user_avatar} fittingType="fill" className="w-full h-full" />
                ) : (
                  (c.user_name || "?").charAt(0)
                )}
              </span>
              <div className="rounded-2xl bg-gray-100 px-3 py-1.5">
                <p className="text-xs font-semibold text-gray-800">{c.user_name?.split(" ")[0]}</p>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
              placeholder="Write a comment..."
              className="h-8 text-xs"
            />
            <button
              onClick={addComment}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ background: FB }}
              aria-label="Send comment"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}