import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Crown, ChevronLeft } from "lucide-react";
import { Image } from "@/components/ui/sk-image";
import { isOnline, statusEmoji, presenceBadge } from "@/lib/presence";
import PresenceBadge from "@/components/presence/PresenceBadge";

const FB = "#1877f2";

export default function MessageHeader({ me, onOpenSettings }) {
  const navigate = useNavigate();
  const name = me?.full_name || "You";
  const city = me?.location || "";
  const online = isOnline(me);
  return (
    <div className="px-4 py-3 flex items-center gap-3" style={{ background: FB }}>
      <button onClick={() => navigate(-1)} aria-label="Back" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-black shrink-0">
        <ChevronLeft size={20} />
      </button>
      <div className="relative shrink-0">
        <span className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex items-center justify-center text-lg font-bold text-white" style={{ background: FB + "55" }}>
          {me?.avatar_url ? <Image src={me.avatar_url} fittingType="fill" className="w-full h-full" /> : (name.charAt(0))}
        </span>
        <PresenceBadge badge={presenceBadge(me)} className="-top-1 -right-1 text-base" />
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