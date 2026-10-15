import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Rewind, FastForward, Music2, MessageCircle, X } from "lucide-react";
import { Image } from "@/components/ui/image";
import { SIZES } from "@/lib/photoEdit";
import KloutButton from "@/components/klout/KloutButton";
import CommentSection from "@/components/comments/CommentSection";

function fmt(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// A single full-screen video with TikTok-style overlays and playback controls.
// Creator info sits at the top-left; likes + comments sit on the right rail.
export default function VideoSlide({ video, active }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showComments, setShowComments] = useState(false);

  const hasMusic = !!video.music_url;
  const filterCss = video.filter && video.filter !== "none" ? video.filter : undefined;
  const overlays = Array.isArray(video.text_overlays) ? video.text_overlays : [];

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      v.pause();
      if (audioRef.current) audioRef.current.pause();
      setPlaying(false);
      setShowComments(false);
    }
  }, [active]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
      if (audioRef.current) audioRef.current.play().catch(() => {});
    } else {
      v.pause();
      if (audioRef.current) audioRef.current.pause();
      setPlaying(false);
    }
  }

  function seek(delta) {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
    if (audioRef.current) audioRef.current.currentTime = v.currentTime;
  }

  function onSeekClick(e) {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = Math.max(0, Math.min(v.duration, pct * v.duration));
    if (audioRef.current) audioRef.current.currentTime = v.currentTime;
  }

  function onTimeUpdate() {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
    setCurrent(v.currentTime);
  }

  return (
    <div
      className="relative h-full w-full flex items-center justify-center overflow-hidden"
      style={{ containerType: "inline-size" }}
      onClick={() => setShowControls((s) => !s)}
    >
      <video
        ref={videoRef}
        src={video.url}
        className="h-full w-full object-cover"
        style={{ filter: filterCss }}
        loop={!hasMusic}
        playsInline
        muted={hasMusic}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
      />
      {hasMusic && <audio ref={audioRef} src={video.music_url} loop />}

      {/* Text overlays */}
      {overlays.map((t, i) => {
        const pct = (SIZES.find((s) => s.id === t.size) || SIZES[1]).pct;
        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%`, transform: "translate(-50%, -50%)" }}
          >
            <span
              className="font-bold text-center whitespace-pre-wrap leading-tight"
              style={{ color: t.color, fontSize: `${pct * 100}cqw`, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            >
              {t.value}
            </span>
          </div>
        );
      })}

      {/* Creator info — top-left corner */}
      {showControls && (
        <div
          className="absolute top-14 left-3 right-16 z-10 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-1">
            {video.user_avatar ? (
              <Image src={video.user_avatar} fittingType="fill" className="w-9 h-9 rounded-full shrink-0 border border-white/40" />
            ) : (
              <span className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm shrink-0">
                {(video.user_name || "?").charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-white font-semibold text-sm drop-shadow">{video.user_name || "Unknown"}</span>
          </div>
          {video.caption && <p className="text-white text-sm leading-snug drop-shadow mb-1">{video.caption}</p>}
          {hasMusic && (
            <div className="flex items-center gap-1 text-white/90 text-xs drop-shadow">
              <Music2 size={12} /> <span className="truncate max-w-[60vw]">{video.music_title} — {video.music_artist}</span>
            </div>
          )}
        </div>
      )}

      {/* Right-side action rail — likes + comments */}
      {showControls && (
        <div
          className="absolute right-2 bottom-32 z-10 flex flex-col items-center gap-4 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <KloutButton target_type="video" target_id={video.id} size="md" menuAlign="right" />
          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex flex-col items-center gap-0.5"
            aria-label="Comments"
          >
            <span className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white">
              <MessageCircle size={22} />
            </span>
          </button>
        </div>
      )}

      {/* Comments drawer */}
      {showComments && showControls && (
        <div
          className="absolute bottom-20 left-2 right-2 z-20 bg-white rounded-2xl max-h-[45%] overflow-y-auto p-3 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm text-gray-900">Comments</h4>
            <button onClick={() => setShowComments(false)} aria-label="Close comments">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <CommentSection videoId={video.id} />
        </div>
      )}

      {/* Playback controls — bottom */}
      {showControls && (
        <div
          className="absolute bottom-4 left-4 right-4 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white text-[11px] tabular-nums">{fmt(current)}</span>
            <div className="flex-1 h-1.5 bg-white/25 rounded-full cursor-pointer" onClick={onSeekClick}>
              <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-white text-[11px] tabular-nums">{fmt(duration)}</span>
          </div>
          <div className="flex items-center justify-center gap-8">
            <button onClick={() => seek(-10)} className="text-white active:scale-90"><Rewind size={26} /></button>
            <button onClick={togglePlay} className="text-white active:scale-90">
              {playing ? <Pause size={36} className="fill-white" /> : <Play size={36} className="fill-white" />}
            </button>
            <button onClick={() => seek(10)} className="text-white active:scale-90"><FastForward size={26} /></button>
          </div>
        </div>
      )}
    </div>
  );
}