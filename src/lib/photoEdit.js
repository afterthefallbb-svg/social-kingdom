// Shared photo-editing constants + canvas baking, used by the composer (Feed)
// and the reusable PhotoEditor modal everywhere else photos are uploaded.

export const FILTERS = [
  { id: "none", label: "Original", css: "none" },
  { id: "mono", label: "Mono", css: "grayscale(1) contrast(1.05)" },
  { id: "sepia", label: "Sepia", css: "sepia(0.8) brightness(1.05)" },
  { id: "vivid", label: "Vivid", css: "saturate(1.6) contrast(1.1)" },
  { id: "warm", label: "Warm", css: "sepia(0.25) saturate(1.4) brightness(1.05)" },
  { id: "cool", label: "Cool", css: "hue-rotate(-12deg) saturate(1.25) brightness(1.02)" },
  { id: "fade", label: "Fade", css: "contrast(0.85) brightness(1.12) saturate(0.8)" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.4) brightness(0.95)" },
];

export const TEXT_COLORS = ["#ffffff", "#000000", "#facc15", "#ef4444", "#22c55e", "#3b82f6", "#ec4899"];

export const SIZES = [
  { id: "s", pct: 0.05 },
  { id: "m", pct: 0.075 },
  { id: "l", pct: 0.11 },
];

// Bake a filter + text overlays into a single JPEG Blob.
export async function bakeImage(imgEl, filterCss, texts, maxSize = 1280) {
  let w = imgEl.naturalWidth;
  let h = imgEl.naturalHeight;
  const scale = Math.min(1, maxSize / Math.max(w, h));
  w = Math.round(w * scale);
  h = Math.round(h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.filter = filterCss === "none" ? "none" : filterCss;
  ctx.drawImage(imgEl, 0, 0, w, h);
  ctx.filter = "none";
  (texts || []).forEach((t) => {
    if (!t.value) return;
    const pct = (SIZES.find((s) => s.id === t.size) || SIZES[1]).pct;
    const fontSize = Math.round(w * pct);
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = Math.round(fontSize * 0.12);
    ctx.shadowOffsetY = Math.round(fontSize * 0.04);
    ctx.fillStyle = t.color;
    ctx.fillText(t.value, t.x * w, t.y * h);
  });
  return new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.92));
}