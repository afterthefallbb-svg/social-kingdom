import React from "react";
import { Camera, Music2, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

// Slender rectangle for a picture-only post (no text): a compact notice that a
// friend posted a photo, with a small thumbnail — keeps the feed uncluttered.
export default function FeedPhotoNotice({ post, onOpen, me, onDeleted }) {
  const name = post.author_name || "Someone";
  const initial = name.charAt(0).toUpperCase();
  const canDelete = !!me && post.author_id === me.id;

  async function del(e) {
    e.stopPropagation();
    if (!canDelete) return;
    if (!window.confirm("Delete this photo post? This cannot be undone.")) return;
    try {
      await base44.entities.Post.delete(post.id);
      onDeleted?.(post);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen && onOpen(post)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen && onOpen(post); }}
      className="w-full flex items-center gap-3 bg-white rounded-xl shadow-sm px-3 py-2 text-left"
    >
      <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center font-bold shrink-0" style={{ color: FB }}>
        {post.author_avatar ? (
          <Image src={post.author_avatar} fittingType="fill" className="w-full h-full" />
        ) : (
          initial
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          <span style={{ color: FB }}>{name}</span> posted a picture
        </p>
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Camera size={11} /> {post.created_date ? new Date(post.created_date).toLocaleDateString() : ""}
        </p>
      </div>
      {post.music_url && <Music2 size={13} className="text-gray-400 shrink-0" />}
      {post.image_url && (
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0">
          <Image src={post.image_url} fittingType="fill" className="w-full h-full" />
        </div>
      )}
      {canDelete && (
        <button
          onClick={del}
          className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
          aria-label="Delete photo post"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}