import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const FB = "#1877f2";

export default function PostComposer({ me, onPosted }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [saving, setSaving] = useState(false);
  const name = me?.full_name || me?.email || "You";
  const initial = name.charAt(0).toUpperCase();

  async function post() {
    if (!text.trim()) {
      toast({ title: "Write something to post" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Post.create({
        content: text.trim(),
        image_url: img.trim(),
        author_id: me.id,
        author_name: name,
        author_avatar: me?.avatar_url || "",
        likes: 0
      });
      setText("");
      setImg("");
      setOpen(false);
      onPosted && onPosted();
    } catch (e) {
      toast({ title: "Could not post", description: String(e.message || e) });
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-3 flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold shrink-0" style={{ color: FB }}>
          {initial}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex-1 text-left text-sm text-gray-500 bg-gray-100 rounded-full px-4 py-2.5"
        >
          What's on your mind, {name.split(" ")[0]}?
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold shrink-0" style={{ color: FB }}>
          {initial}
        </div>
        <p className="text-sm font-semibold text-gray-800">{name}</p>
      </div>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Share something with your community…"
        className="w-full mt-2 text-sm outline-none resize-none bg-transparent"
      />
      <div className="flex items-center gap-2 mt-1">
        <input
          value={img}
          onChange={(e) => setImg(e.target.value)}
          placeholder="Image URL (optional)"
          className="flex-1 text-xs border rounded-lg px-2 py-1.5 outline-none"
        />
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => { setOpen(false); setText(""); setImg(""); }}
          className="text-sm font-semibold text-gray-500 px-3 py-1.5"
        >
          Cancel
        </button>
        <button
          onClick={post}
          disabled={saving}
          className="text-sm font-semibold text-white px-4 py-1.5 rounded-lg"
          style={{ background: FB }}
        >
          {saving ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}