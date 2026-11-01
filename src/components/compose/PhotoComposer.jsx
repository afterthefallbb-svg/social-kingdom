import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import MusicSearch from "@/components/compose/MusicSearch";
import { FILTERS, TEXT_COLORS, SIZES, bakeImage } from "@/lib/photoEdit";
import {
  Camera, ImagePlus, X, Type, Palette, Music2, Sparkles, Send, Plus
} from "lucide-react";

const FB = "#1877f2";

export default function PhotoComposer({ me, onPosted, open, onOpenChange }) {
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const setOpen = (v) => (controlled ? onOpenChange(v) : setInternalOpen(v));
  const isOpen = controlled ? open : internalOpen;

  const [caption, setCaption] = useState("");
  const [imgUrl, setImgUrl] = useState(null); // object URL for preview
  const [imgEl, setImgEl] = useState(null); // loaded HTMLImageElement
  const [filter, setFilter] = useState(FILTERS[0]);
  const [texts, setTexts] = useState([]); // {id, value, color, size, x, y}
  const [music, setMusic] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeText, setActiveText] = useState(null);
  const [showText, setShowText] = useState(false);
  const fileRef = useRef(null);
  const [capture, setCapture] = useState(false);
  const stageRef = useRef(null);

  const name = me?.full_name || me?.email || "You";

  useEffect(() => {
    return () => { if (imgUrl) URL.revokeObjectURL(imgUrl); };
  }, [imgUrl]);

  function reset() {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(null); setImgEl(null); setFilter(FILTERS[0]);
    setTexts([]); setMusic(null); setCaption(""); setShowText(false); setActiveText(null);
  }

  function pickFile(useCamera) {
    setCapture(useCamera);
    setTimeout(() => fileRef.current && fileRef.current.click(), 0);
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => setImgEl(im);
    im.src = url;
    setImgUrl(url);
    setTexts([]); setFilter(FILTERS[0]);
    setOpen(true);
  }

  function addText() {
    const t = {
      id: Date.now(),
      value: "Tap to edit",
      color: "#ffffff",
      size: "m",
      x: 0.5,
      y: 0.5,
    };
    setTexts((p) => [...p, t]);
    setActiveText(t.id);
    setShowText(true);
  }

  function updateText(id, patch) {
    setTexts((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeText(id) {
    setTexts((p) => p.filter((t) => t.id !== id));
    if (activeText === id) setActiveText(null);
  }

  // Drag a text overlay across the stage (fractions of stage size)
  function startDrag(e, id) {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    setActiveText(id);
    const move = (ev) => {
      const rect = stage.getBoundingClientRect();
      const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      const cy = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top;
      updateText(id, {
        x: Math.max(0.05, Math.min(0.95, cx / rect.width)),
        y: Math.max(0.05, Math.min(0.95, cy / rect.height)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  // Bake filter + text overlays into a single JPEG using the shared helper.
  async function bake() {
    return await bakeImage(imgEl, filter.css, texts);
  }

  async function post() {
    if (!imgEl && !caption.trim()) {
      toast({ title: "Add a photo or write something to post" });
      return;
    }
    setSaving(true);
    try {
      let image_url = "";
      if (imgEl) {
        const blob = await bake();
        if (!blob) throw new Error("Could not process image");
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        image_url = file_url;
      }
      await base44.entities.Post.create({
        content: caption.trim(),
        image_url,
        author_id: me.id,
        author_name: name,
        author_avatar: me?.avatar_url || "",
        likes: 0,
        music_url: music?.previewUrl || "",
        music_title: music?.trackName || "",
        music_artist: music?.artistName || "",
        music_artwork: music?.artworkUrl || "",
      });
      reset();
      setOpen(false);
      onPosted && onPosted();
    } catch (e) {
      toast({ title: "Could not post", description: String(e.message || e) });
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-3 flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold shrink-0" style={{ color: FB }}>
          {(name).charAt(0).toUpperCase()}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex-1 text-left text-sm text-gray-500 bg-gray-100 rounded-full px-4 py-2.5"
        >
          Share a photo or thought…
        </button>
        <button
          onClick={() => pickFile(true)}
          aria-label="Take photo"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white"
          style={{ background: FB }}
        >
          <Camera size={18} />
        </button>
      </div>
    );
  }

  const active = texts.find((t) => t.id === activeText);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture={capture ? "environment" : undefined}
        className="hidden"
        onChange={onFile}
      />

      <div className="flex items-center justify-between mb-2">
        <button onClick={() => { reset(); setOpen(false); }} className="text-sm font-semibold text-gray-500">
          Cancel
        </button>
        <p className="text-sm font-bold text-gray-800">New Post</p>
        <button
          onClick={post}
          disabled={saving}
          className="text-sm font-semibold text-white px-3 py-1.5 rounded-lg"
          style={{ background: FB }}
        >
          {saving ? "Posting…" : <span className="flex items-center gap-1"><Send size={14} /> Post</span>}
        </button>
      </div>

      {/* Stage / photo area */}
      <div
        ref={stageRef}
        className="relative w-full rounded-xl overflow-hidden bg-black"
        style={{ aspectRatio: "4 / 5", containerType: "inline-size" }}
      >
        {imgUrl ? (
          <>
            <img
              src={imgUrl}
              alt="preview"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: filter.css === "none" ? undefined : filter.css }}
            />
            {texts.map((t) => {
              const pct = (SIZES.find((s) => s.id === t.size) || SIZES[1]).pct;
              return (
                <div
                  key={t.id}
                  onPointerDown={(e) => startDrag(e, t.id)}
                  onClick={() => { setActiveText(t.id); setShowText(true); }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 select-none touch-none cursor-move"
                  style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}
                >
                  <span
                    className="inline-block whitespace-pre-wrap text-center font-bold leading-tight"
                    style={{
                      color: t.color,
                      fontSize: `${pct * 100}cqw`,
                      textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                      outline: activeText === t.id ? "2px dashed #fff" : "none",
                      outlineOffset: "2px",
                    }}
                  >
                    {t.value || " "}
                  </span>
                </div>
              );
            })}
            {/* Text toolbar */}
            {active && showText && (
              <div className="absolute left-2 right-2 bottom-2 bg-black/60 rounded-lg p-2">
                <input
                  value={active.value}
                  onChange={(e) => updateText(active.id, { value: e.target.value })}
                  className="w-full text-xs text-white bg-white/10 rounded px-2 py-1 outline-none mb-2"
                  placeholder="Type your text"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateText(active.id, { color: c })}
                      className="w-5 h-5 rounded-full border-2"
                      style={{ background: c, borderColor: active.color === c ? "#fff" : "transparent" }}
                    />
                  ))}
                  <div className="flex gap-1 ml-auto">
                    {SIZES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => updateText(active.id, { size: s.id })}
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          background: active.size === s.id ? "#fff" : "transparent",
                          color: active.size === s.id ? "#000" : "#fff",
                          border: "1px solid #fff",
                        }}
                      >
                        {s.id === "s" ? "S" : s.id === "m" ? "M" : "L"}
                      </button>
                    ))}
                    <button onClick={() => removeText(active.id)} className="text-white ml-1">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <button
              onClick={() => pickFile(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white"
              style={{ background: FB }}
            >
              <Camera size={18} /> Take Photo
            </button>
            <button
              onClick={() => pickFile(false)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-white/15 text-white"
            >
              <ImagePlus size={18} /> Upload
            </button>
          </div>
        )}
      </div>

      {/* Filter row */}
      {imgEl && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2 pb-1" style={{ scrollSnapType: "x mandatory" }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f)}
              className="shrink-0 flex flex-col items-center gap-1"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden border-2"
                style={{ borderColor: filter.id === f.id ? FB : "transparent" }}>
                <img src={imgUrl} alt="" className="w-full h-full object-cover"
                  style={{ filter: f.css === "none" ? undefined : f.css }} />
              </div>
              <span className="text-[10px]" style={{ color: filter.id === f.id ? FB : "#9ca3af" }}>{f.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tools: add text, change photo, music */}
      {imgEl && (
        <div className="flex items-center gap-2 mt-2">
          <button onClick={addText} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: FB + "18", color: FB }}>
            <Type size={14} /> Text
          </button>
          <button onClick={() => pickFile(false)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <ImagePlus size={14} /> Replace
          </button>
          <button onClick={() => setFilter(FILTERS[0])} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <Sparkles size={14} /> Reset
          </button>
          <button onClick={() => setShowText((s) => !s)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <Palette size={14} /> Edit text
          </button>
        </div>
      )}

      {/* Music (only with a photo) */}
      {imgEl && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1">
            <Music2 size={12} /> Add music behind your photo
          </p>
          <MusicSearch selected={music} onSelect={setMusic} />
        </div>
      )}

      {/* Caption */}
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={2}
        placeholder="Write a caption…"
        className="w-full mt-2 text-sm outline-none resize-none bg-gray-50 rounded-lg p-2"
      />
    </div>
  );
}