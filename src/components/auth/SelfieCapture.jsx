import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Check, Loader2, UserCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { checkDuplicateFace } from "@/lib/faceCheck";

const FB = "#1877f2";

// Required selfie verification: the camera is opened on tap (mobile browsers only
// allow it from a user gesture), the shot is uploaded privately, and the server
// inspects it to confirm it really shows a live human face. Only a verified
// selfie is handed back to the parent to finish creating the account.
export default function SelfieCapture({ onCaptured, title = "Verify with a selfie", subtitle }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [shot, setShot] = useState(null);
  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [blocked, setBlocked] = useState(false);

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
      setError("This browser can't open the camera. Open Social Kingdom in Safari or Chrome and allow camera access.");
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
          /* autoplay may need another tap */
        }
      }
      setCameraReady(true);
    } catch {
      setError("Camera access is blocked. Allow the camera for this site, then tap Try again.");
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => () => stopCamera(), []);

  function takeSelfie() {
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
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not capture the photo. Try again.");
          return;
        }
        setShot({ blob, url: URL.createObjectURL(blob) });
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  }

  async function confirm() {
    if (!shot || checking) return;
    setChecking(true);
    setError("");
    try {
      const file = new File([shot.blob], "selfie.jpg", { type: shot.blob.type || "image/jpeg" });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
      const res = await base44.functions.invoke("verifySelfie", { signed_url, file_uri });
      const data = res?.data || {};
      if (!data.verified) {
        setShot(null);
        setError(
          `We couldn't confirm a real face${data.reason ? ` (${data.reason})` : ""}. Face the camera in good light and take a new selfie.`
        );
        startCamera();
        return;
      }
      const dup = await checkDuplicateFace();
      if (dup.duplicate) {
        setShot(null);
        stopCamera();
        setBlocked(true);
        return;
      }
      onCaptured?.(file_uri);
    } catch {
      setShot(null);
      setError("We couldn't check that selfie. Check your connection and take a new one.");
      startCamera();
    } finally {
      setChecking(false);
    }
  }

  function retake() {
    setShot(null);
    startCamera();
  }

  if (blocked) {
    return (
      <div className="text-center max-w-sm mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "#dc2626" }}>
          <UserCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-foreground">This face already has an account</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          This selfie matches an existing Social Kingdom account. Each person can only verify one account, so a second
          one can't be created with the same face.
        </p>
        <a
          href="/login"
          className="mt-5 inline-flex items-center justify-center w-52 h-12 rounded-full text-white font-semibold"
          style={{ background: FB }}
        >
          Sign in instead
        </a>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: FB }}>
        <UserCircle className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {subtitle || "Take a live selfie to prove you're a real person. It stays private on your account."}
      </p>

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

        {!shot && cameraReady && (
          <button
            onClick={takeSelfie}
            className="mt-4 inline-flex items-center justify-center gap-2 w-52 h-12 rounded-full text-white font-semibold"
            style={{ background: FB }}
          >
            <Camera size={18} /> Take selfie
          </button>
        )}

        {!shot && !cameraReady && (
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

        {shot && (
          <div className="mt-4 flex gap-3 w-full max-w-xs">
            <button
              onClick={retake}
              disabled={checking}
              className="flex-1 h-12 rounded-full border border-border font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw size={16} /> Retake
            </button>
            <button
              onClick={confirm}
              disabled={checking}
              className="flex-1 h-12 rounded-full text-white font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: FB }}
            >
              {checking ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
              {checking ? "Checking…" : "Confirm"}
            </button>
          </div>
        )}

        <p className="mt-4 text-[11px] text-muted-foreground max-w-xs">
          Camera access is required for verification. Your face must be clearly visible and fill the frame.
        </p>
      </div>
    </div>
  );
}