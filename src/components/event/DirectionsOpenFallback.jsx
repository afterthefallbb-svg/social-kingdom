import React, { useState } from "react";
import { Copy } from "lucide-react";

export default function DirectionsOpenFallback({ url }) {
  const [message, setMessage] = useState("");
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Directions link copied. Paste it into your browser.");
    } catch {
      setMessage("Press and hold the link below to copy it, then paste it into your browser.");
    }
  }
  return (
    <div className="relative z-[601] mt-2 rounded-lg border border-border bg-card p-3 text-sm text-card-foreground">
      <p>If Google Maps didn’t open, copy this link and open it in Safari or Chrome.</p>
      <input
        aria-label="Google Maps directions link"
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="mt-2 w-full rounded border border-input bg-background p-2 text-xs text-foreground"
      />
      <button type="button" onClick={copyLink} className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-brand">
        <Copy size={16} /> Copy directions link
      </button>
      {message && <p role="status" className="mt-1 text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}