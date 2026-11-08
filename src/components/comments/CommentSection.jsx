import React, { useEffect, useState } from "react";
import { MessageCircle, Send, Trash2, Reply, Pencil, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/sk-image";
import { Input } from "@/components/ui/input";
import KloutButton from "@/components/klout/KloutButton";
import VerifiedBadge from "@/components/VerifiedBadge";

const FB = "#1877f2";

// Comment section with reply threading. Works on posts (postId) or videos
// (videoId). Replies nest under their parent comment via parent_id.
export default function CommentSection({ postId, videoId }) {
  const [me, setMe] = useState(null);
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const scope = videoId ? { video_id: videoId } : { post_id: postId };

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    if (!postId && !videoId) return;
    base44.entities.Comment
      .count(scope)
      .then(setCount)
      .catch(() => setCount(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, videoId]);

  useEffect(() => {
    if (!open || (!postId && !videoId)) return;
    base44.entities.Comment
      .filter(scope, { sort: "created_date", limit: 200 })
      .then((p) => setComments(p.items || []))
      .catch(() => setComments([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, postId, videoId]);

  async function add() {
    if (!text.trim() || !me) return;
    try {
      const c = await base44.entities.Comment.create({
        ...scope,
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

  async function reply(parentId) {
    if (!replyText.trim() || !me) return;
    try {
      const c = await base44.entities.Comment.create({
        ...scope,
        parent_id: parentId,
        user_id: me.id,
        user_name: me.full_name,
        user_avatar: me.avatar_url,
        content: replyText.trim(),
      });
      setComments((prev) => [...prev, c]);
      setCount((n) => n + 1);
      setReplyText("");
      setReplyTo(null);
    } catch {
      /* ignore */
    }
  }

  async function remove(id) {
    try {
      await base44.entities.Comment.delete(id);
      setComments((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
      setCount((n) => Math.max(0, n - 1));
    } catch {
      /* ignore */
    }
  }

  function startEdit(c) {
    setEditId(c.id);
    setEditText(c.content || "");
  }

  async function saveEdit(id) {
    if (!editText.trim()) return;
    try {
      await base44.entities.Comment.update(id, { content: editText.trim() });
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, content: editText.trim() } : c)));
    } catch {
      /* ignore */
    }
    setEditId(null);
    setEditText("");
  }

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesOf = (parentId) => comments.filter((c) => c.parent_id === parentId);

  function Avatar({ c, size = "w-7 h-7" }) {
    return (
      <span
        className={`${size} rounded-full overflow-hidden border flex items-center justify-center text-[10px] font-bold shrink-0`}
        style={{ borderColor: FB, background: FB + "22", color: FB }}
      >
        {c.user_avatar ? (
          <Image src={c.user_avatar} fittingType="fill" className="w-full h-full" />
        ) : (
          (c.user_name || "?").charAt(0)
        )}
      </span>
    );
  }

  function CommentItem({ c, isReply }) {
    return (
      <div className={isReply ? "flex gap-2 items-start ml-9" : "flex gap-2 items-start"}>
        <Avatar c={c} />
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-gray-100 px-3 py-1.5">
            <p className="text-xs font-semibold text-gray-800 flex items-center gap-1">
              {c.user_name?.split(" ")[0]}
              <VerifiedBadge id={c.user_id} name={c.user_name} compact />
            </p>
            {editId === c.id ? (
              <div className="flex gap-1 mt-1">
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(c.id); }}
                  className="h-7 text-xs"
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(c.id)}
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white"
                  style={{ background: FB }}
                  aria-label="Save edit"
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => { setEditId(null); setEditText(""); }}
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gray-200 text-gray-600"
                  aria-label="Cancel edit"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-700 break-words">{c.content}</p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <KloutButton target_type="comment" target_id={c.id} size="sm" />
            <button
              onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-500"
              aria-label="Reply"
            >
              <Reply size={12} /> Reply
            </button>
            {me && c.user_id === me.id && editId !== c.id && (
              <button
                onClick={() => startEdit(c)}
                className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-500"
                aria-label="Edit comment"
              >
                <Pencil size={12} /> Edit
              </button>
            )}
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

          {replyTo === c.id && (
            <div className="flex gap-2 mt-1.5">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") reply(c.id); }}
                placeholder={`Reply to ${c.user_name?.split(" ")[0]}…`}
                className="h-8 text-xs"
                autoFocus
              />
              <button
                onClick={() => reply(c.id)}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: FB }}
                aria-label="Send reply"
              >
                <Send size={13} />
              </button>
            </div>
          )}

          {repliesOf(c.id).map((r) => (
            <div key={r.id} className="mt-1.5">
              <CommentItem c={r} isReply />
            </div>
          ))}
        </div>
      </div>
    );
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
          {topLevel.map((c) => (
            <CommentItem key={c.id} c={c} />
          ))}

          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") add(); }}
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