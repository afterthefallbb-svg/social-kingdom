import React from "react";
import { Image } from "@/components/ui/image";
import { Camera } from "lucide-react";

const FB = "#1877f2";

// Slender rectangle for a picture-only post (no text): a compact notice that a
// friend posted a photo, with a small thumbnail — keeps the feed uncluttered.
export default function FeedPhotoNotice({ post, onOpen }) {
  const name = post.author_name || "Someone";
  const initial = name.charAt(0).toUpperCase();
  return (
    <button
      type="button"
      onClick={() => onOpen && onOpen(post)}
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
      {post.image_url && (
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0">
          <Image src={post.image_url} fittingType="fill" className="w-full h-full" />
        </div>
      )}
    </button>
  );
}