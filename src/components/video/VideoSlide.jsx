import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Rewind, FastForward, Music2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { SIZES } from "@/lib/photoEdit";

function fmt(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// A single full-screen video with TikTok-style overlays and playback controls.
export default function VideoSlide({ video, active }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [showControls, setShowControls] = useState(true);

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

      {/* Creator info + controls */}
      {showControls && (
        <>
          <div className="absolute bottom-24 left-4 right-16 z-10 pointer-events-none" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              {video.user_avatar ? (
                <Image src={video.user_avatar} fittingType="fill" className="w-9 h-9 rounded-full shrink-0" />
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
                <Music2 size={12} /> <span className="truncate">{video.music_title} — {video.music_artist}</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
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
        </>
      )}
    </div>
  );
}