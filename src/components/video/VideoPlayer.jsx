import React, { useState, useRef, useEffect } from "react";
import { X, Plus, BookmarkCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import VideoSlide from "./VideoSlide";

// Full-screen, TikTok-style vertical video feed. Swipe top-to-bottom
// to move between videos. Each video fills the screen (object-cover),
// works in any orientation, and has play/pause, seek, and 10s skip controls.
export default function VideoPlayer({ videos, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const scrollRef = useRef(null);
  const scrollTimer = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose && onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (scrollRef.current && startIndex > 0) {
      const child = scrollRef.current.children[startIndex];
      if (child) scrollRef.current.scrollTop = child.offsetTop;
    }
  }, [startIndex]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const i = Math.round(el.scrollTop / el.clientHeight);
      if (i !== index && i >= 0 && i < videos.length) setIndex(i);
    }, 80);
  }

  const [me, setMe] = useState(null);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!active) return;
        setMe(u);
      } catch {
        /* ignore */
      }
    })();
    return () => { active = false; };
  }, []);

  const current = videos[index];

  useEffect(() => {
    let active = true;
    setSavedId(null);
    (async () => {
      if (!me || !current?.id) return;
      try {
        const res = await base44.entities.SavedVideo.filter(
          { user_id: me.id, video_id: current.id },
          { limit: 1 }
        );
        if (active && res.items && res.items[0]) setSavedId(res.items[0].id);
      } catch {
        /* ignore */
      }
    })();
    return () => { active = false; };
  }, [me, current?.id]);

  async function toggleSave(e) {
    e.stopPropagation();
    if (!me || !current) return;
    if (savedId) {
      try {
        await base44.entities.SavedVideo.delete(savedId);
        setSavedId(null);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      const rec = await base44.entities.SavedVideo.create({
        user_id: me.id,
        video_id: current.id,
        url: current.url,
        thumbnail: current.thumbnail,
        caption: current.caption,
        video_user_name: current.user_name,
        video_user_avatar: current.user_avatar,
        music_url: current.music_url,
        music_title: current.music_title,
        music_artist: current.music_artist,
        music_artwork: current.music_artwork,
      });
      setSavedId(rec.id);
    } catch {
      /* ignore */
    }
  }

  if (!videos || videos.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[900] bg-black">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white"
      >
        <X size={22} />
      </button>
      <button
        onClick={toggleSave}
        className="absolute top-16 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/40 text-white text-sm font-semibold"
        aria-label={savedId ? "Saved" : "Save"}
      >
        {savedId ? <BookmarkCheck size={18} /> : <Plus size={18} />}
        {savedId ? "Saved" : "Save"}
      </button>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {videos.map((v, i) => (
          <div key={v.id || i} className="h-full w-full snap-start snap-always shrink-0">
            <VideoSlide video={v} active={i === index} />
          </div>
        ))}
      </div>
    </div>
  );
}