import React from "react";
import { Settings, Crown } from "lucide-react";
import { Image } from "@/components/ui/image";
import { isOnline, statusEmoji } from "@/lib/presence";

const FB = "#1877f2";

export default function MessageHeader({ me, onOpenSettings }) {
  const name = me?.full_name || "You";
  const city = me?.location || "";
  const online = isOnline(me);
  return (
    <div className="px-4 py-3 flex items-center gap-3" style={{ background: FB }}>
      <div className="relative shrink-0">
        <span className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex items-center justify-center text-lg font-bold text-white" style={{ background: FB + "55" }}>
          {me?.avatar_url ? <Image src={me.avatar_url} fittingType="fill" className="w-full h-full" /> : (name.charAt(0))}
        </span>
        <span className="absolute -top-1 -right-1 text-base leading-none bg-white rounded-full px-0.5">
          {online ? statusEmoji(me) : "⚫"}
        </span>
      </div>
      <div className="flex-1 min-w-0 text-white">
        <p className="font-bold truncate">{name}</p>
        <p className="text-xs text-white/80 truncate">
          {online ? "Active now" : city || "Offline"}
        </p>
      </div>
      <button onClick={onOpenSettings} aria-label="Message settings" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
        <Settings size={18} />
      </button>
    </div>
  );
}