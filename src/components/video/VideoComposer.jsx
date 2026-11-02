import React, { useRef, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { FILTERS, TEXT_COLORS, SIZES } from "@/lib/photoEdit";
import MusicSearch from "@/components/compose/MusicSearch";
import VideoCategoryPicker from "./VideoCategoryPicker";
import { X, Camera, ImagePlus, Type, Music2, Loader2, Send, Sparkles } from "lucide-react";

const FB = "#1877f2";

// Full video creation tool: record or upload (no URL box), then edit with
// filters, draggable text overlays, music, and a caption — then upload
// (stored publicly — anyone with the link can open them) and save.
export default function VideoComposer({ category, eventId, clickId, onCreated, onClose }) {
  const [me, setMe] = useState(null);
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [texts, setTexts] = useState([]);
  const [music, setMusic] = useState(null);
  const [caption, setCaption] = useState("");
  const [cat, setCat] = useState(category || "");
  const [busy, setBusy] = useState(false);
  const [activeText, setActiveText] = useState(null);
  const [showText, setShowText] = useState(false);
  const fileRef = useRef(null);
  const [capture, setCapture] = useState(false);
  const stageRef = useRef(null);

  useEffect(() => { base44.auth.me().then(setMe).catch(() => {}); }, []);
  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);

  function reset() {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(null); setVideoUrl(null); setFilter(FILTERS[0]);
    setTexts([]); setMusic(null); setCaption(""); setCat(category || ""); setShowText(false); setActiveText(null);
  }

  function cancel() {
    reset();
    onClose && onClose();
  }

  function pickFile(useCamera) {
    setCapture(useCamera);
    setTimeout(() => fileRef.current && fileRef.current.click(), 0);
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!(f.type || "").startsWith("video")) { toast({ title: "Please select a video" }); return; }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setTexts([]); setFilter(FILTERS[0]);
  }

  function addText() {
    const t = { id: Date.now(), value: "Tap to edit", color: "#ffffff", size: "m", x: 0.5, y: 0.5 };
    setTexts((p) => [...p, t]); setActiveText(t.id); setShowText(true);
  }
  function updateText(id, patch) { setTexts((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t))); }
  function removeText(id) { setTexts((p) => p.filter((t) => t.id !== id)); if (activeText === id) setActiveText(null); }

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
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  }

  async function generateThumbnail(url) {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.src = url; v.muted = true; v.crossOrigin = "anonymous";
      v.onloadedmetadata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 2); };
      v.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = v.videoWidth || 360; canvas.height = v.videoHeight || 640;
          canvas.getContext("2d").drawImage(v, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(resolve, "image/jpeg", 0.8);
        } catch { resolve(null); }
      };
      v.onerror = () => resolve(null);
    });
  }

  async function save() {
    if (!file || !me) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      let thumbUrl = "";
      try {
        const thumbBlob = await generateThumbnail(videoUrl);
        if (thumbBlob) {
          const thumbFile = new File([thumbBlob], "thumbnail.jpg", { type: "image/jpeg" });
          const { file_url: tUrl } = await base44.integrations.Core.UploadPublicFile({ file: thumbFile });
          thumbUrl = tUrl;
        }
      } catch {}
      await base44.entities.Video.create({
        url: file_url, thumbnail: thumbUrl, caption: caption.trim(),
        category: cat || "", user_id: me.id,
        user_name: me.full_name || me.email || "You", user_avatar: me.avatar_url || "",
        event_id: eventId || "", click_id: clickId || "",
        music_url: music?.previewUrl || "", music_title: music?.trackName || "",
        music_artist: music?.artistName || "", music_artwork: music?.artworkUrl || "",
        text_overlays: texts.map(({ id, ...rest }) => rest), filter: filter.css,
      });
      toast({ title: "Video posted!" });
      reset(); onCreated && onCreated(); onClose && onClose();
    } catch (err) {
      toast({ title: "Upload failed", description: String(err.message || err) });
    } finally { setBusy(false); }
  }

  const active = texts.find((t) => t.id === activeText);

  return (
    <div className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[94vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]" onClick={(e) => e.stopPropagation()}>
        <input ref={fileRef} type="file" accept="video/*" capture={capture ? "environment" : undefined} className="hidden" onChange={onFile} />
        <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10" style={{ borderColor: "#eef0f3" }}>
          <button onClick={cancel} className="p-1 text-gray-500" aria-label="Cancel"><X size={20} /></button>
          <h3 className="font-bold text-gray-900">Create Video</h3>
          <span className="w-8" />
        </div>

        <div className="p-3">
          <div ref={stageRef} className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "9 / 16", containerType: "inline-size" }}>
            {videoUrl ? (
              <>
                <video src={videoUrl} className="absolute inset-0 w-full h-full object-cover" style={{ filter: filter.css === "none" ? undefined : filter.css }} autoPlay loop muted playsInline />
                {texts.map((t) => {
                  const pct = (SIZES.find((s) => s.id === t.size) || SIZES[1]).pct;
                  return (
                    <div key={t.id} onPointerDown={(e) => startDrag(e, t.id)} onClick={() => { setActiveText(t.id); setShowText(true); }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 select-none touch-none cursor-move"
                      style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}>
                      <span className="inline-block whitespace-pre-wrap text-center font-bold leading-tight"
                        style={{ color: t.color, fontSize: `${pct * 100}cqw`, textShadow: "0 2px 8px rgba(0,0,0,0.6)", outline: activeText === t.id ? "2px dashed #fff" : "none", outlineOffset: "2px" }}>
                        {t.value || " "}
                      </span>
                    </div>
                  );
                })}
                {active && showText && (
                  <div className="absolute left-2 right-2 bottom-2 bg-black/60 rounded-lg p-2">
                    <input value={active.value} onChange={(e) => updateText(active.id, { value: e.target.value })}
                      className="w-full text-xs text-white bg-white/10 rounded px-2 py-1 outline-none mb-2" placeholder="Type your text" />
                    <div className="flex items-center gap-2 flex-wrap">
                      {TEXT_COLORS.map((c) => (
                        <button key={c} onClick={() => updateText(active.id, { color: c })} className="w-5 h-5 rounded-full border-2"
                          style={{ background: c, borderColor: active.color === c ? "#fff" : "transparent" }} />
                      ))}
                      <div className="flex gap-1 ml-auto">
                        {SIZES.map((s) => (
                          <button key={s.id} onClick={() => updateText(active.id, { size: s.id })} className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: active.size === s.id ? "#fff" : "transparent", color: active.size === s.id ? "#000" : "#fff", border: "1px solid #fff" }}>
                            {s.id === "s" ? "S" : s.id === "m" ? "M" : "L"}
                          </button>
                        ))}
                        <button onClick={() => removeText(active.id)} className="text-white ml-1"><X size={14} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                <button onClick={() => pickFile(true)} className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white" style={{ background: FB }}>
                  <Camera size={20} /> Record
                </button>
                <button onClick={() => pickFile(false)} className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-white/15 text-white">
                  <ImagePlus size={20} /> Upload
                </button>
              </div>
            )}
          </div>

          {videoUrl && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2 pb-1" style={{ scrollSnapType: "x mandatory" }}>
              {FILTERS.map((f) => (
                <button key={f.id} onClick={() => setFilter(f)} className="shrink-0 flex flex-col items-center gap-1" style={{ scrollSnapAlign: "start" }}>
                  <div className="w-12 h-12 rounded-lg overflow-hidden border-2" style={{ borderColor: filter.id === f.id ? FB : "transparent" }}>
                    <video src={videoUrl} className="w-full h-full object-cover" style={{ filter: f.css === "none" ? undefined : f.css }} muted preload="metadata" />
                  </div>
                  <span className="text-[10px]" style={{ color: filter.id === f.id ? FB : "#9ca3af" }}>{f.label}</span>
                </button>
              ))}
            </div>
          )}

          {videoUrl && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button onClick={addText} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: FB + "18", color: FB }}><Type size={14} /> Text</button>
              <button onClick={() => setShowText((s) => !s)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"><Type size={14} /> Edit text</button>
              <button onClick={() => setFilter(FILTERS[0])} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"><Sparkles size={14} /> Reset</button>
              <button onClick={() => pickFile(false)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"><ImagePlus size={14} /> Replace</button>
            </div>
          )}

          {videoUrl && (
            <div className="mt-3">
              <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption…" className="w-full text-sm border rounded-lg px-3 py-2 outline-none" />
            </div>
          )}

          {videoUrl && (
            <div className="mt-3 border-t border-gray-100 pt-2">
              <VideoCategoryPicker value={cat} onChange={setCat} />
            </div>
          )}

          {videoUrl && (
            <div className="mt-3 border-t border-gray-100 pt-2">
              <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1"><Music2 size={12} /> Add music to your video</p>
              <MusicSearch selected={music} onSelect={setMusic} />
            </div>
          )}

          {busy && <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-sm"><Loader2 className="animate-spin" size={16} /> Uploading…</div>}

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
              disabled={busy || !videoUrl}
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