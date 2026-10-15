import React, { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";

const FB = "#1877f2";

// Full-screen game player with an iframe. Calls onOpen when mounted (to track
// the game as "currently playing") and onClose when dismissed (to move it to
// the "played" history).
export default function GamePlayer({ game, onClose, onOpen }) {
  useEffect(() => {
    if (game && onOpen) onOpen(game);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [game]);

  if (!game) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/90 shrink-0">
        <button
          onClick={onClose}
          aria-label="Close game"
          className="flex items-center gap-1 text-sm font-semibold text-white px-2 py-1"
        >
          <X size={22} />
        </button>
        <h2 className="text-sm font-bold text-white flex-1 truncate">{game.title}</h2>
        <a
          href={game.embed}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-white/70 px-2 py-1"
        >
          <ExternalLink size={14} /> Open
        </a>
      </div>
      {/* Game iframe */}
      <iframe
        src={game.embed}
        title={game.title}
        className="flex-1 w-full border-0"
        allow="autoplay; fullscreen; gamepad; pointer-lock; microphone; camera"
        allowFullScreen
      />
    </div>
  );
}