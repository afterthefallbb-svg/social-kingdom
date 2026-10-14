import React, { useEffect, useState } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import KloutButton from "@/components/klout/KloutButton";

const FB = "#1877f2";

export default function CommentSection({ postId }) {
  const [me, setMe] = useState(null);
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    if (!postId) return;
    base44.entities.Comment
      .count({ post_id: postId })
      .then(setCount)
      .catch(() => setCount(0));
  }, [postId]);

  useEffect(() => {
    if (!open || !postId) return;
    base44.entities.Comment
      .filter({ post_id: postId }, { sort: "created_date", limit: 200 })
      .then((p) => setComments(p.items || []))
      .catch(() => setComments([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, postId]);

  async function add() {
    if (!text.trim() || !me) return;
    try {
      const c = await base44.entities.Comment.create({
        post_id: postId,
        user_id: me.id,
        user_name: me.full_name,
        user_avatar: me.avatar_url,
        content: text.trim(),
      });
      setComments((prev) => [...prev, c]);
      setCount((n) => n + 1);
      setText("");
    } catch {
      /* ignore */
    }
  }

  async function remove(id) {
    try {
      await base44.entities.Comment.delete(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setCount((n) => Math.max(0, n - 1));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs text-gray-500"
        aria-label="Comments"
      >
        <MessageCircle size={14} /> {count > 0 ? count : "Comment"}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 items-start">
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
              <div className="flex-1 min-w-0">
                <div className="rounded-2xl bg-gray-100 px-3 py-1.5">
                  <p className="text-xs font-semibold text-gray-800">
                    {c.user_name?.split(" ")[0]}
                  </p>
                  <p className="text-sm text-gray-700 break-words">{c.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <KloutButton
                    target_type="comment"
                    target_id={c.id}
                    size="sm"
                  />
                  {me && c.user_id === me.id && (
                    <button
                      onClick={() => remove(c.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500"
                      aria-label="Delete comment"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
              placeholder="Write a comment..."
              className="h-8 text-xs"
            />
            <button
              onClick={add}
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