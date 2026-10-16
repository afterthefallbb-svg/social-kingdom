import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Check, Loader2, UserCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FB = "#1877f2";

// Selfie verification step: capture a live photo from the device camera (with a
// file-upload fallback), then upload it privately. The returned file_uri is
// handed to the parent so it can be saved on the user's record.
export default function SelfieCapture({ onCaptured, title = "Verify with a selfie", subtitle }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [shot, setShot] = useState(null);
  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      }
      setCameraReady(true);
    } catch (e) {
      setError("Camera unavailable — you can upload a selfie photo instead.");
      setCameraReady(false);
    }
  }

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function snap() {
    const video = videoRef.current;
    if (!video) return;
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.translate(size, 0);
    ctx.scale(-1, 1); // un-mirror the captured frame
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setShot({ blob, url: URL.createObjectURL(blob) });
    }, "image/jpeg", 0.9);
  }

  async function confirm() {
    if (!shot) return;
    setUploading(true);
    try {
      const file = new File([shot.blob], "selfie.jpg", { type: "image/jpeg" });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      onCaptured?.(file_uri);
    } catch (e) {
      setError("Could not upload selfie. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setShot({ blob: f, url: URL.createObjectURL(f) });
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: FB }}>
        <UserCircle className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {subtitle || "Take a quick selfie so we know you're real. This stays private on your account."}
      </p>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative w-56 h-56 rounded-full overflow-hidden bg-gray-100 border-4" style={{ borderColor: FB }}>
          {shot ? (
            <img src={shot.url} alt="Selfie preview" className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          )}
          {!shot && !cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Camera size={40} />
            </div>
          )}
        </div>

        {error && <p className="text-destructive text-xs mt-3">{error}</p>}

        {!shot && (
          <button
            onClick={snap}
            disabled={!cameraReady}
            className="mt-4 inline-flex items-center justify-center gap-2 w-48 h-12 rounded-full text-white font-semibold disabled:opacity-50"
            style={{ background: FB }}
          >
            <Camera size={18} /> {cameraReady ? "Take selfie" : "Starting camera…"}
          </button>
        )}

        {!shot && (
          <label className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer">
            <RefreshCw size={13} /> Or upload a photo
            <input type="file" accept="image/*" capture="user" className="hidden" onChange={onFile} />
          </label>
        )}

        {shot && (
          <div className="mt-4 flex gap-3 w-full max-w-xs">
            <button
              onClick={() => { setShot(null); startCamera(); }}
              className="flex-1 h-12 rounded-full border border-border font-semibold text-sm inline-flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Retake
            </button>
            <button
              onClick={confirm}
              disabled={uploading}
              className="flex-1 h-12 rounded-full text-white font-semibold text-sm inline-flex items-center justify-center gap-2"
              style={{ background: FB }}
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
              {uploading ? "Saving…" : "Confirm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}