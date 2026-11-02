import React, { useEffect, useRef, useState } from "react";
import { Check, Loader2, X, ZoomIn } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const FB = "#1877f2";
const OUTPUT = 512;

/* Circular crop tool for profile photos. The picked photo is dragged and
   zoomed inside a circle, then baked to a square JPEG so the avatar never has
   to be squashed into the round frame. */
export default function AvatarCropDialog({ file, onCropped, onClose }) {
  const [src, setSrc] = useState(null);
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(0);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!src) return;
    const im = new window.Image();
    im.onload = () => setImg(im);
    im.src = src;
  }, [src]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSize(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const base = img && size ? Math.max(size / img.naturalWidth, size / img.naturalHeight) : 1;
  const drawW = img ? img.naturalWidth * base * zoom : 0;
  const drawH = img ? img.naturalHeight * base * zoom : 0;
  const maxX = Math.max(0, (drawW - size) / 2);
  const maxY = Math.max(0, (drawH - size) / 2);

  const clamp = (x, y, mx = maxX, my = maxY) => ({
    x: Math.max(-mx, Math.min(mx, x)),
    y: Math.max(-my, Math.min(my, y)),
  });

  function startDrag(e) {
    e.preventDefault();
    dragRef.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
    const move = (ev) => {
      const start = dragRef.current;
      if (!start) return;
      setOffset(clamp(start.ox + (ev.clientX - start.px), start.oy + (ev.clientY - start.py)));
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function changeZoom(next) {
    const z = Number(next);
    setZoom(z);
    const nextBase = img && size ? Math.max(size / img.naturalWidth, size / img.naturalHeight) : 1;
    const mx = Math.max(0, (img ? img.naturalWidth * nextBase * z - size : 0) / 2);
    const my = Math.max(0, (img ? img.naturalHeight * nextBase * z - size : 0) / 2);
    setOffset((o) => clamp(o.x, o.y, mx, my));
  }

  async function save() {
    if (!img || !size) return;
    setBusy(true);
    try {
      const k = drawW / img.naturalWidth; // displayed px per source px
      const crop = size / k;              // source square shown inside the circle
      const sx = (img.naturalWidth - crop) / 2 - offset.x / k;
      const sy = (img.naturalHeight - crop) / 2 - offset.y / k;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, crop, crop, 0, 0, OUTPUT, OUTPUT);

      const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.92));
      if (!blob) throw new Error("Could not process image");
      const out = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: out });
      onCropped(file_url);
    } catch (err) {
      toast({ title: "Could not save photo", description: String(err.message || err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[850] flex items-end sm:items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: "#eef0f3" }}>
          <button onClick={onClose} className="p-1 text-gray-500" aria-label="Cancel">
            <X size={20} />
          </button>
          <h3 className="font-bold text-gray-900">Crop Profile Photo</h3>
          <button
            onClick={save}
            disabled={busy || !img}
            className="text-sm font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60"
            style={{ background: FB }}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Use Photo
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">Drag the photo to center your face, then zoom until it fills the circle.</p>

          <div
            ref={stageRef}
            onPointerDown={startDrag}
            className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-900 select-none touch-none cursor-move"
          >
            {img && (
              <img
                src={src}
                alt=""
                draggable={false}
                className="absolute left-1/2 top-1/2 max-w-none max-h-none"
                style={{
                  width: drawW,
                  height: drawH,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            )}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, transparent 0 49.4%, rgba(0,0,0,0.62) 50%)" }} />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-full rounded-full border-2 border-white/90" />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <ZoomIn size={16} className="text-gray-500 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => changeZoom(e.target.value)}
              className="w-full"
              style={{ accentColor: FB }}
              aria-label="Zoom photo"
            />
          </div>
        </div>
      </div>
    </div>
  );
}