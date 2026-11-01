import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Check, Loader2, UserCircle, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FB = "#1877f2";

// Selfie verification step: the camera is opened on tap (mobile browsers only
// allow it from a user gesture), with a photo-upload fallback that stays
// available whenever the camera can't start. The confirmed photo is uploaded
// privately and its file_uri is handed to the parent to save on the account.
export default function SelfieCapture({ onCaptured, title = "Verify with a selfie", subtitle }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const [shot, setShot] = useState(null);
  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [uploading, setUploading] = useState(false);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }

  async function startCamera() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't open the camera here — upload a photo instead.");
      return;
    }
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          /* autoplay may need another tap; the button already starts it */
        }
      }
      setCameraReady(true);
    } catch {
      setError("Camera unavailable — upload a photo instead.");
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => () => stopCamera(), []);

  function snap() {
    const video = videoRef.current;
    const vw = video?.videoWidth || 0;
    const vh = video?.videoHeight || 0;
    if (!video || !vw || !vh) {
      setError("The camera is still warming up — tap again in a second.");
      return;
    }
    setError("");
    const size = Math.min(vw, vh);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.translate(size, 0);
    ctx.scale(-1, 1); // un-mirror the captured frame
    ctx.drawImage(video, (vw - size) / 2, (vh - size) / 2, size, size, 0, 0, size, size);
    canvas.toBlob((blob) => {
      if (blob) setShot({ blob, url: URL.createObjectURL(blob) });
    }, "image/jpeg", 0.9);
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    stopCamera();
    setShot({ blob: f, url: URL.createObjectURL(f) });
    e.target.value = "";
  }

  async function confirm() {
    if (!shot || uploading) return;
    setUploading(true);
    setError("");
    try {
      const type = shot.blob.type || "image/jpeg";
      const file = new File([shot.blob], "selfie.jpg", { type });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      onCaptured?.(file_uri);
    } catch {
      setError("Could not upload the photo. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
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

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={onFile}
      />

      <div className="mt-6 flex flex-col items-center">
        <div className="relative w-56 h-56 rounded-full overflow-hidden bg-gray-100 border-4" style={{ borderColor: FB }}>
          {shot ? (
            <img src={shot.url} alt="Selfie preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Camera size={40} />
                </div>
              )}
            </>
          )}
        </div>

        {error && <p className="text-destructive text-xs mt-3 max-w-xs">{error}</p>}

        {!shot && (
          <>
            {cameraReady ? (
              <button
                onClick={snap}
                className="mt-4 inline-flex items-center justify-center gap-2 w-52 h-12 rounded-full text-white font-semibold"
                style={{ background: FB }}
              >
                <Camera size={18} /> Take selfie
              </button>
            ) : (
              <button
                onClick={startCamera}
                disabled={starting}
                className="mt-4 inline-flex items-center justify-center gap-2 w-52 h-12 rounded-full text-white font-semibold disabled:opacity-60"
                style={{ background: FB }}
              >
                {starting ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                {starting ? "Starting camera…" : "Open camera"}
              </button>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 inline-flex items-center justify-center gap-2 w-52 h-11 rounded-full border-2 font-semibold text-sm"
              style={{ borderColor: FB, color: FB }}
            >
              <Upload size={16} /> Upload a photo
            </button>
          </>
        )}

        {shot && (
          <div className="mt-4 flex gap-3 w-full max-w-xs">
            <button
              onClick={() => {
                setShot(null);
                startCamera();
              }}
              className="flex-1 h-12 rounded-full border border-border font-semibold text-sm inline-flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Retake
            </button>
            <button
              onClick={confirm}
              disabled={uploading}
              className="flex-1 h-12 rounded-full text-white font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
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