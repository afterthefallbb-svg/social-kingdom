import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import PhotoEditor from "@/components/compose/PhotoEditor";
import PostCard from "./PostCard";

const FB = "#1877f2";

export default function EventPosts({ eventId }) {
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [music, setMusic] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
    loadPosts();
  }, [eventId]);

  async function loadPosts() {
    const p = await base44.entities.Post
      .filter({ event_id: eventId }, { sort: "-created_date", limit: 100 })
      .catch(() => ({ items: [] }));
    setPosts(p.items || []);
  }

  async function post() {
    if (!text.trim() && !imgUrl) return;
    setBusy(true);
    try {
      await base44.entities.Post.create({
        content: text.trim(),
        image_url: imgUrl,
        author_id: me.id,
        author_name: me.full_name,
        author_avatar: me.avatar_url,
        event_id: eventId,
        likes: 0,
        music_url: music?.previewUrl || "",
        music_title: music?.trackName || "",
        music_artist: music?.artistName || "",
        music_artwork: music?.artworkUrl || ""
      });
      setText("");
      setImgUrl("");
      setMusic(null);
      await loadPosts();
    } catch (e) {
      toast({ title: "Could not post", description: String(e.message || e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-bold text-gray-900 mb-3">Posts & Comments</h3>

      <div className="rounded-xl border p-2.5" style={{ borderColor: "#eef0f3" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Share something about this event..."
          className="w-full bg-transparent outline-none text-sm resize-none"
        />
        {imgUrl && (
          <div className="relative mt-2">
            <Image src={imgUrl} fittingType="fill" className="w-full h-32 rounded-lg" />
            <button
              onClick={() => { setImgUrl(""); setMusic(null); }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => setUploading(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: FB }}
          >
            <ImageIcon size={15} /> Photo
          </button>
          <button
            onClick={post}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-semibold text-white"
            style={{ background: FB }}
          >
            <Send size={13} /> {busy ? "Posting…" : "Post"}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {posts.length === 0 && <p className="text-xs text-gray-400">No posts yet. Start the conversation!</p>}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      {uploading && (
        <PhotoEditor
          label="Post Photo"
          enableMusic
          onUploaded={(url, type, m) => { setImgUrl(url); setMusic(m); setUploading(false); }}
          onClose={() => setUploading(false)}
        />
      )}
    </div>
  );
}