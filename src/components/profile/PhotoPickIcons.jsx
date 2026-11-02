import React from "react";
import { Camera, ImagePlus, Loader2 } from "lucide-react";

const FB = "#1877f2";

// The two big entry points every photo slot uses: the phone's library or its
// camera. No text box, no URL field — just two large icon buttons.
export default function PhotoPickIcons({ onLibrary, onCamera, busy, disabled }) {
  const base =
    "flex-1 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 py-4 text-[11px] font-bold disabled:opacity-50";
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onLibrary}
        disabled={disabled || busy}
        className={base}
        style={{ borderColor: "#cfe0fb", background: "#f5f9ff", color: FB }}
      >
        {busy ? <Loader2 size={26} className="animate-spin" /> : <ImagePlus size={26} />}
        Upload Photos
      </button>
      <button
        type="button"
        onClick={onCamera}
        disabled={disabled || busy}
        className={base}
        style={{ borderColor: "#cfe0fb", background: "#f5f9ff", color: FB }}
      >
        <Camera size={26} />
        Take a Picture
      </button>
    </div>
  );
}