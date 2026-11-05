import React from "react";
import { X } from "lucide-react";
import { Image } from "@/components/ui/image";
import { presenceBadge } from "@/lib/presence";
import PresenceBadge from "@/components/presence/PresenceBadge";

const FB = "#1877f2";

// Floating chat bubble. A closed chat collapses to this: tap it to reopen the
// same conversation window, tap × to dismiss it.
export default function ChatBubble({ conversation, peer, unread = 0, onOpen, onDismiss }) {
  const title = conversation?.is_group ? conversation.name || "Group chat" : peer?.full_name || "Chat";
  const avatar = conversation?.is_group ? conversation.avatar : peer?.avatar_url;

  return (
    <div className="fixed right-3 bottom-28 z-40 flex items-center gap-1.5">
      <button
        onClick={onOpen}
        aria-label={`Reopen chat with ${title}`}
        className="relative flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-white shadow-lg border"
        style={{ borderColor: FB + "55" }}
      >
        <span
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center text-sm font-bold shrink-0"
          style={{ borderColor: FB + "77", background: FB + "22", color: FB }}
        >
          {avatar ? <Image src={avatar} fittingType="fill" className="w-full h-full" /> : title.charAt(0)}
          {!conversation?.is_group && (
            <PresenceBadge badge={presenceBadge(peer)} className="-bottom-1 -right-1 text-[9px]" />
          )}
        </span>
        <span className="max-w-[88px] truncate text-xs font-semibold text-gray-800">
          {title.split(" ")[0]}
        </span>
        {unread > 0 && (
          <span
            className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            style={{ background: FB }}
          >
            {unread}
          </span>
        )}
      </button>
      {/* 44px tap area (10px transparent padding each side) around the 24px
          visual button, so the row looks exactly as it did before. */}
      <button
        onClick={onDismiss}
        aria-label="Hide chat bubble"
        className="relative -m-2.5 p-2.5 rounded-full flex items-center justify-center"
      >
        <span className="w-6 h-6 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500">
          <X size={13} />
        </span>
      </button>
    </div>
  );
}