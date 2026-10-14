import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { presenceBadge } from "@/lib/presence";
import PresenceBadge from "@/components/presence/PresenceBadge";
import { getAllDrafts } from "@/lib/messaging";

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

export default function ConversationList({ me, onOpen, refreshKey, scope = "all", direction = "incoming" }) {
  const [convs, setConvs] = useState([]);
  const [peers, setPeers] = useState({});
  const [friendIds, setFriendIds] = useState(new Set());
  const [clickmateIds, setClickmateIds] = useState(new Set());
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!me?.id) return;
      setLoading(true);
      setDrafts(getAllDrafts());
      const res = await base44.entities.Conversation.filter({}, { limit: 200, sort: "-last_message_at" }).catch(() => ({ items: [] }));
      const mine = (res.items || []).filter((c) => c.member_ids?.includes(me.id));
      const ids = new Set();
      mine.forEach((c) => { if (!c.is_group) c.member_ids.forEach((id) => id !== me.id && ids.add(id)); });

      const peerMap = {};
      if (ids.size) {
        const u = await base44.entities.User.filter({ id: { $in: [...ids] } }, { limit: 200 }).catch(() => ({ items: [] }));
        (u.items || []).forEach((x) => { peerMap[x.id] = x; });
      }
      const fr = await base44.entities.Friendship.filter({ user_id: me.id, status: "accepted" }, { limit: 200 }).catch(() => ({ items: [] }));
      (fr.items || []).forEach((f) => {
        if (!peerMap[f.friend_id]) {
          peerMap[f.friend_id] = { id: f.friend_id, full_name: f.friend_name, avatar_url: f.friend_avatar, location: f.friend_city, last_seen: null, show_online: true, status_emoji: "👑" };
        }
      });
      const mem = await base44.entities.ClickMembership.filter({ user_id: me.id }, { limit: 200 }).catch(() => ({ items: [] }));
      (mem.items || []).forEach((m) => {
        if (!peerMap[m.user_id]) {
          peerMap[m.user_id] = { id: m.user_id, full_name: m.user_name, avatar_url: m.user_avatar, location: m.user_city, last_seen: null, show_online: true, status_emoji: "👑" };
        }
      });
      if (!active) return;
      setPeers(peerMap);
      setFriendIds(new Set(fr.items.map((f) => f.friend_id)));
      setClickmateIds(new Set(mem.items.map((m) => m.user_id).filter((id) => id !== me.id)));

      const withUnread = await Promise.all(mine.map(async (c) => {
        const cnt = await base44.entities.Message.count({
          conversation_id: c.id, read: false, sender_id: { $ne: me.id },
        }).catch(() => 0);
        return { ...c, unread: cnt };
      }));
      withUnread.sort((a, b) => {
        if ((a.unread > 0) !== (b.unread > 0)) return a.unread > 0 ? -1 : 1;
        return new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0);
      });
      setConvs(withUnread);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [me?.id, refreshKey]);

  function peerFor(c) {
    if (c.is_group) return null;
    const pid = c.member_ids?.find((id) => id !== me.id);
    return peers[pid] || { id: pid };
  }
  function titleFor(c) {
    if (c.is_group) return c.name || "Group chat";
    return peerFor(c)?.full_name || "Unknown";
  }
  function avatarFor(c) {
    if (c.is_group) return c.avatar || "";
    return peerFor(c)?.avatar_url || "";
  }
  function scopeOf(c) {
    if (c.is_group) return "clicks";
    const pid = c.member_ids?.find((id) => id !== me.id);
    if (friendIds.has(pid)) return "friends";
    if (clickmateIds.has(pid)) return "clicks";
    return "other";
  }

  const filtered = convs.filter((c) => {
    if (scope !== "all" && scopeOf(c) !== scope) return false;
    if (direction === "incoming") {
      if (c.last_sender_id === me.id) return false;
    } else if (direction === "sent") {
      if (c.last_sender_id !== me.id) return false;
    } else if (direction === "drafts") {
      if (!drafts[c.id]) return false;
    }
    return true;
  });

  if (loading) return <div className="p-6 text-center text-sm text-gray-400">Loading chats…</div>;
  if (filtered.length === 0) {
    const msg = direction === "drafts"
      ? "No drafts."
      : direction === "sent"
        ? `No sent messages${scope === "all" ? "" : ` in ${scope}`}.`
        : `No incoming messages${scope === "all" ? "" : ` from ${scope}`}.`;
    return <div className="p-6 text-center text-sm text-gray-400">{msg}</div>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {filtered.map((c) => {
        const peer = peerFor(c);
        const draftText = drafts[c.id];
        return (
          <button key={c.id} onClick={() => onOpen(c, peer)} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 text-left">
            <span className="relative w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center text-base font-bold shrink-0" style={{ borderColor: FB + "55", background: FB + "22", color: FB }}>
              {avatarFor(c) ? <Image src={avatarFor(c)} fittingType="fill" className="w-full h-full" /> : (titleFor(c).charAt(0) || "?")}
              {!c.is_group && <PresenceBadge badge={presenceBadge(peer)} className="-bottom-1 -right-1 text-xs" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-900 truncate">{titleFor(c)}</p>
                <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(c.last_message_at)}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {draftText ? <span className="text-amber-600">Draft: {draftText}</span> : (c.last_message || "Say hello 👋")}
              </p>
            </div>
            {c.unread > 0 && direction !== "sent" && direction !== "drafts" && (
              <span className="text-[10px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: FB }}>{c.unread}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}