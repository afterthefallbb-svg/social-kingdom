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

export default function ConversationList({ me, onOpen, refreshKey, tab = "all" }) {
  const [convs, setConvs] = useState([]);
  const [peers, setPeers] = useState({});
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
      // 1) real user records (have live last_seen / status)
      if (ids.size) {
        const u = await base44.entities.User.filter({ id: { $in: [...ids] } }, { limit: 200 }).catch(() => ({ items: [] }));
        (u.items || []).forEach((x) => { peerMap[x.id] = x; });
      }
      // 2) friendship snapshot fallback
      const fr = await base44.entities.Friendship.filter({ user_id: me.id, status: "accepted" }, { limit: 200 }).catch(() => ({ items: [] }));
      (fr.items || []).forEach((f) => {
        if (!peerMap[f.friend_id]) {
          peerMap[f.friend_id] = { id: f.friend_id, full_name: f.friend_name, avatar_url: f.friend_avatar, location: f.friend_city, last_seen: null, show_online: true, status_emoji: "👑" };
        }
      });
      // 3) CliQ membership fallback
      const mem = await base44.entities.ClickMembership.filter({ user_id: me.id }, { limit: 200 }).catch(() => ({ items: [] }));
      (mem.items || []).forEach((m) => {
        if (!peerMap[m.user_id]) {
          peerMap[m.user_id] = { id: m.user_id, full_name: m.user_name, avatar_url: m.user_avatar, location: m.user_city, last_seen: null, show_online: true, status_emoji: "👑" };
        }
      });
      if (!active) return;
      setPeers(peerMap);

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

  const filtered = convs.filter((c) => {
    if (tab === "received") return c.last_sender_id && c.last_sender_id !== me.id;
    if (tab === "sent") return c.last_sender_id === me.id;
    if (tab === "drafts") return !!drafts[c.id];
    return true;
  });

  if (loading) return <div className="p-6 text-center text-sm text-gray-400">Loading chats…</div>;
  if (filtered.length === 0) {
    const msg = tab === "drafts" ? "No drafts." : tab === "received" ? "No received messages." : tab === "sent" ? "No sent messages." : "No conversations yet. Tap a friend above to start chatting.";
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
            {c.unread > 0 && tab !== "sent" && tab !== "drafts" && (
              <span className="text-[10px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: FB }}>{c.unread}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}