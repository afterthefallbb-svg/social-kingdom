import React, { useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { presenceBadge } from "@/lib/presence";
import PresenceBadge from "@/components/presence/PresenceBadge";
import { Check, Archive } from "lucide-react";

const FB = "#1877f2";

function timeAgo(iso) {
  if (!iso) return "";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function ConversationRow({
  conv, peer, title, avatar, draftText, selecting, isSelected, direction, me,
  onOpen, onArchiveToggle, onLongPress, onToggleSelect,
}) {
  const [dx, setDx] = useState(0);
  const start = useRef(null);
  const moved = useRef(false);
  const longTimer = useRef(null);
  const suppressClick = useRef(false);
  const isArchivedView = direction === "archived";

  function clearLong() {
    if (longTimer.current) { clearTimeout(longTimer.current); longTimer.current = null; }
  }

  function onTouchStart(e) {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    moved.current = false;
    suppressClick.current = false;
    if (!selecting) {
      longTimer.current = setTimeout(() => {
        if (!moved.current) {
          suppressClick.current = true;
          onLongPress?.(conv);
        }
      }, 500);
    }
  }
  function onTouchMove(e) {
    if (!start.current) return;
    const t = e.touches[0];
    const delta = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    if (Math.abs(delta) > 8 || Math.abs(dy) > 8) {
      moved.current = true;
      clearLong();
    }
    if (Math.abs(delta) > Math.abs(dy)) {
      setDx(Math.min(0, Math.max(-104, delta)));
    }
  }
  function onTouchEnd() {
    clearLong();
    if (dx < -50) {
      suppressClick.current = true;
      onArchiveToggle?.(conv);
    }
    setDx(0);
    start.current = null;
  }

  function handleClick() {
    if (suppressClick.current) { suppressClick.current = false; return; }
    if (selecting) { onToggleSelect?.(conv); return; }
    onOpen?.(conv, peer);
  }

  const showUnread = conv.unread > 0 && direction !== "sent" && direction !== "drafts" && direction !== "archived" && !selecting;

  return (
    <div className="relative overflow-hidden border-b border-gray-100">
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center px-5 select-none"
        style={{ background: isArchivedView ? "#16a34a" : "#dc2626" }}
      >
        <span className="flex items-center gap-1 text-white text-xs font-semibold">
          <Archive size={14} /> {isArchivedView ? "Unarchive" : "Archive"}
        </span>
      </div>
      <div
        className="w-full flex items-center gap-3 px-3 py-3 bg-white text-left"
        style={{
          transform: `translateX(${dx}px)`,
          transition: start.current ? "none" : "transform 0.18s ease",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); if (!selecting) onLongPress?.(conv); }}
      >
        {selecting && (
          <span
            className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: isSelected ? FB : "#d1d5db", background: isSelected ? FB : "transparent" }}
          >
            {isSelected && <Check size={14} className="text-white" />}
          </span>
        )}
        <span
          className="relative w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center text-base font-bold shrink-0"
          style={{ borderColor: FB + "55", background: FB + "22", color: FB }}
        >
          {avatar ? <Image src={avatar} fittingType="fill" className="w-full h-full" /> : (title.charAt(0) || "?")}
          {!conv.is_group && <PresenceBadge badge={presenceBadge(peer)} className="-bottom-1 -right-1 text-xs" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-900 truncate">{title}</p>
            <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(conv.last_message_at)}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">
            {draftText ? <span className="text-amber-600">Draft: {draftText}</span> : (conv.last_message || "Say hello 👋")}
          </p>
        </div>
        {showUnread && (
          <span className="text-[10px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: FB }}>
            {conv.unread}
          </span>
        )}
      </div>
    </div>
  );
}