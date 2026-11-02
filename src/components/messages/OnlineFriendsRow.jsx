import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { isOnline, statusEmoji, lastSeenLabel, presenceBadge } from "@/lib/presence";
import { usersByIds } from "@/lib/users";
import PresenceBadge from "@/components/presence/PresenceBadge";

const FB = "#1877f2";

export default function OnlineFriendsRow({ me, onSelectFriend, onLongPress, selecting, selected, toggleSelect }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!me?.id) return;
      const fr = await base44.entities.Friendship.filter(
        { user_id: me.id, status: "accepted" },
        { limit: 200 }
      ).catch(() => ({ items: [] }));
      const ids = fr.items.map((f) => f.friend_id).filter(Boolean);
      const byId = Object.fromEntries(fr.items.map((f) => [f.friend_id, f]));
      const found = ids.length ? await usersByIds(ids) : {};
      const users = Object.values(found);
      // Merge: prefer live user record, fall back to friendship snapshot
      const merged = ids.map((id) => users.find((u) => u.id === id) || { id, full_name: byId[id]?.friend_name, avatar_url: byId[id]?.friend_avatar, location: byId[id]?.friend_city, last_seen: null, show_online: true, status_emoji: "👑" });
      // Sort: online first (most recent last_seen), then offline (most recent first)
      merged.sort((a, b) => {
        const oa = isOnline(a), ob = isOnline(b);
        if (oa && !ob) return -1;
        if (!oa && ob) return 1;
        return (new Date(b.last_seen || 0)) - (new Date(a.last_seen || 0));
      });
      if (active) setFriends(merged);
    })();
    return () => { active = false; };
  }, [me?.id]);

  return (
    <div className="flex items-start gap-3 px-3 py-3 overflow-x-auto no-scrollbar">
      {/* Friends row, smaller avatars */}
      {friends.map((f) => {
        const online = isOnline(f);
        const sel = selecting && selected.includes(f.id);
        return (
          <button
            key={f.id}
            onClick={() => (selecting ? toggleSelect(f) : onSelectFriend(f))}
            onContextMenu={(e) => { e.preventDefault(); onLongPress?.(f); }}
            className="flex flex-col items-center gap-1 shrink-0 w-16"
          >
            <span className="relative w-14 h-14 shrink-0">
              <span className={`w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center text-lg font-bold ${sel ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: sel ? FB : "#d1d5db", background: FB + "22", color: FB }}>
                {f.avatar_url ? <Image src={f.avatar_url} fittingType="fill" className="w-full h-full" /> : (f.full_name?.charAt(0) || "?")}
              </span>
              <PresenceBadge badge={presenceBadge(f)} className="-top-1 -right-1 text-xs" />
            </span>
            <span className="text-[10px] text-gray-700 truncate w-full text-center">{f.full_name?.split(" ")[0]}</span>
            <span className="text-[9px] text-gray-400 truncate w-full text-center">{lastSeenLabel(f)}</span>
          </button>
        );
      })}
      {friends.length === 0 && (
        <p className="text-xs text-gray-400 self-center">No friends yet. Add friends from profiles.</p>
      )}
    </div>
  );
}