import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { FILTERS, TEXT_COLORS, SIZES, bakeImage } from "@/lib/photoEdit";
import MusicSearch from "@/components/compose/MusicSearch";
import {
  X, Camera, ImagePlus, Type, Sparkles, Music2, Loader2, Send,
} from "lucide-react";

const FB = "#1877f2";

// Reusable photo editor modal: camera/upload -> filter -> draggable text ->
// optional music -> bake + upload (stored publicly) -> onUploaded(url, type, music).
// Drop-in replacement for the old PhotoUpload, with the full creative editor.
// Videos (when allowVideo) upload raw with no editing (canvas baking is image-only).
export default function PhotoEditor({
  label = "Upload Photo",
  onUploaded,
  onClose,
  enableMusic = false,
  allowVideo = false,
  aspect = "4 / 5",
}) {
  const [imgUrl, setImgUrl] = useState(null);
  const [imgEl, setImgEl] = useState(null);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [texts, setTexts] = useState([]);
  const [music, setMusic] = useState(null);
  const [busy, setBusy] = useState(false);
  const [activeText, setActiveText] = useState(null);
  const [showText, setShowText] = useState(false);
  const fileRef = useRef(null);
  const [capture, setCapture] = useState(false);
  const stageRef = useRef(null);
  const [directUrl, setDirectUrl] = useState("");
  const [link, setLink] = useState("");

  const hasImage = Boolean(imgUrl);

  useEffect(() => () => { if (imgUrl) URL.revokeObjectURL(imgUrl); }, [imgUrl]);

  function reset() {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(null); setImgEl(null); setFilter(FILTERS[0]);
    setTexts([]); setMusic(null); setShowText(false); setActiveText(null);
    setDirectUrl(""); setLink("");
  }

  function cancel() {
    reset();
    onClose();
  }

  function useLink() {
    const v = link.trim();
    if (!/^https?:\/\/\S+/i.test(v)) {
      toast({ title: "Enter a full image link", description: "It should start with https://" });
      return;
    }
    if (imgUrl && imgUrl.startsWith("blob:")) URL.revokeObjectURL(imgUrl);
    setDirectUrl(v);
    setImgUrl(v);
    setImgEl(null);
    setFilter(FILTERS[0]);
    setTexts([]);
  }

  function pickFile(useCamera) {
    setCapture(useCamera);
    setTimeout(() => fileRef.current && fileRef.current.click(), 0);
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    // Video: upload raw, no editor.
    if (allowVideo && (f.type || "").startsWith("video")) {
      setBusy(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: f });
        onUploaded(file_url, "video", null);
        onClose();
      } catch (err) {
        toast({ title: "Upload failed", description: String(err.message || err) });
      } finally {
        setBusy(false);
      }
      return;
    }
    if (imgUrl && imgUrl.startsWith("blob:")) URL.revokeObjectURL(imgUrl);
    setDirectUrl(""); setLink("");
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => setImgEl(im);
    im.src = url;
    setImgUrl(url);
    setTexts([]); setFilter(FILTERS[0]);
  }

  function addText() {
    const t = { id: Date.now(), value: "Tap to edit", color: "#ffffff", size: "m", x: 0.5, y: 0.5 };
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

  const musicPayload = music
    ? {
        previewUrl: music.previewUrl,
        trackName: music.trackName,
        artistName: music.artistName,
        artworkUrl: music.artworkUrl,
      }
    : null;

  async function save() {
    // A pasted link is already a live image — save it as-is.
    if (directUrl) {
      onUploaded(directUrl, "image", musicPayload);
      reset();
      onClose();
      return;
    }
    if (!imgEl) return;
    setBusy(true);
    try {
      const blob = await bakeImage(imgEl, filter.css, texts);
      if (!blob) throw new Error("Could not process image");
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onUploaded(file_url, "image", musicPayload);
      reset();
      onClose();
    } catch (err) {
      toast({ title: "Upload failed", description: String(err.message || err) });
    } finally {
      setBusy(false);
    }
  }

  const active = texts.find((t) => t.id === activeText);

  return (
    <div
      className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={fileRef}
          type="file"
          accept={allowVideo ? "image/*,video/*" : "image/*"}
          capture={capture ? "environment" : undefined}
          className="hidden"
          onChange={onFile}
        />

        <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white" style={{ borderColor: "#eef0f3" }}>
          <button onClick={cancel} className="p-1 text-gray-500" aria-label="Cancel">
            <X size={20} />
          </button>
          <h3 className="font-bold text-gray-900">{label}</h3>
          <span className="w-8" />
        </div>

        <div className="p-3">
          {/* Stage */}
          <div
            ref={stageRef}
            className="relative w-full rounded-xl overflow-hidden bg-black"
            style={{ aspectRatio: aspect, containerType: "inline-size" }}
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

          {/* Paste a link instead of uploading a file */}
          <div className="flex gap-2 mt-2">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Or paste an image link (https://…)"
              autoComplete="off"
              className="flex-1 min-w-0 text-xs border rounded-lg px-3 py-2 outline-none"
            />
            <button
              onClick={useLink}
              className="shrink-0 text-xs font-semibold px-3 rounded-lg border"
              style={{ borderColor: FB, color: FB }}
            >
              Use link
            </button>
          </div>

          {/* Filters */}
          {imgEl && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2 pb-1" style={{ scrollSnapType: "x mandatory" }}>
              {FILTERS.map((f) => (
                <button key={f.id} onClick={() => setFilter(f)} className="shrink-0 flex flex-col items-center gap-1" style={{ scrollSnapAlign: "start" }}>
                  <div className="w-12 h-12 rounded-lg overflow-hidden border-2" style={{ borderColor: filter.id === f.id ? FB : "transparent" }}>
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" style={{ filter: f.css === "none" ? undefined : f.css }} />
                  </div>
                  <span className="text-[10px]" style={{ color: filter.id === f.id ? FB : "#9ca3af" }}>{f.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tools */}
          {imgEl && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                <Type size={14} /> Edit text
              </button>
            </div>
          )}

          {/* Music */}
          {enableMusic && imgEl && (
            <div className="mt-2 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                  <Music2 size={12} /> Add music behind your photo
                </p>
                {music && (
                  <button
                    onClick={() => setMusic(null)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500"
                    aria-label="Remove music"
                  >
                    <X size={12} /> Remove song
                  </button>
                )}
              </div>
              <MusicSearch selected={music} onSelect={setMusic} />
            </div>
          )}

          {busy && (
            <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm">
              <Loader2 className="animate-spin" size={16} /> Saving…
            </div>
          )}

          {/* Save / Cancel */}
          <div className="flex gap-2 mt-3 sticky bottom-0 bg-white pt-2 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
            <button
              onClick={cancel}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold border border-gray-300 text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={busy || !hasImage}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-1 disabled:opacity-50"
              style={{ background: FB }}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}