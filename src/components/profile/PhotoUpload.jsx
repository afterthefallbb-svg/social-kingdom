import React, { useRef, useState } from "react";
import { X, Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FB = "#1877f2";

// Uploads a photo via the browser camera or file picker. Files are stored
// publicly (UploadPublicFile) so profile/event photos are visible to others.
export default function PhotoUpload({ label = "Upload Photo", onUploaded, onClose }) {
  const cameraRef = useRef(null);
  const libraryRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onUploaded(file_url);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-black/45"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">{label}</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {busy ? (
          <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
            <Loader2 className="animate-spin" size={18} /> Uploading…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-xl border-2 p-4 hover:bg-blue-50"
              style={{ borderColor: FB, color: FB }}
            >
              <Camera size={26} />
              <span className="text-sm font-semibold">Take Photo</span>
            </button>
            <button
              onClick={() => libraryRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-xl border-2 p-4 hover:bg-gray-50"
              style={{ borderColor: "#d1d5db", color: "#374151" }}
            >
              <ImageIcon size={26} />
              <span className="text-sm font-semibold">Browse</span>
            </button>
          </div>
        )}

        {err && <p className="text-xs text-red-500 mt-3">{err}</p>}

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={libraryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}