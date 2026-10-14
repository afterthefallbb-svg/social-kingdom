import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { isOnline, statusEmoji, lastSeenLabel } from "@/lib/presence";

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

export default function ConversationList({ me, onOpen, refreshKey }) {
  const [convs, setConvs] = useState([]);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!me?.id) return;
      setLoading(true);
      const res = await base44.entities.Conversation.filter({}, { limit: 200, sort: "-last_message_at" }).catch(() => ({ items: [] }));
      const mine = (res.items || []).filter((c) => c.member_ids?.includes(me.id));
      // gather peer ids for 1:1 chats
      const ids = new Set();
      mine.forEach((c) => { if (!c.is_group) c.member_ids.forEach((id) => id !== me.id && ids.add(id)); });
      let userMap = {};
      if (ids.size) {
        const u = await base44.entities.User.filter({ id: { $in: [...ids] } }, { limit: 200 }).catch(() => ({ items: [] }));
        userMap = Object.fromEntries((u.items || []).map((x) => [x.id, x]));
      }
      if (!active) return;
      setMembers(userMap);
      // compute unread + sort (unread first, then by last_message_at)
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

  function titleFor(c) {
    if (c.is_group) return c.name || "Group chat";
    const pid = c.member_ids?.find((id) => id !== me.id);
    const u = members[pid];
    return u?.full_name || "CliQ Member";
  }
  function avatarFor(c) {
    if (c.is_group) return c.avatar || "";
    const pid = c.member_ids?.find((id) => id !== me.id);
    return members[pid]?.avatar_url || "";
  }
  function peerFor(c) {
    if (c.is_group) return null;
    const pid = c.member_ids?.find((id) => id !== me.id);
    return members[pid] || { id: pid };
  }

  if (loading) return <div className="p-6 text-center text-sm text-gray-400">Loading chats…</div>;
  if (convs.length === 0) return <div className="p-6 text-center text-sm text-gray-400">No conversations yet. Tap a friend above to start chatting.</div>;

  return (
    <div className="divide-y divide-gray-100">
      {convs.map((c) => {
        const peer = peerFor(c);
        const online = peer && isOnline(peer);
        return (
          <button key={c.id} onClick={() => onOpen(c, peer)} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 text-left">
            <span className="relative w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center text-base font-bold shrink-0" style={{ borderColor: FB + "55", background: FB + "22", color: FB }}>
              {avatarFor(c) ? <Image src={avatarFor(c)} fittingType="fill" className="w-full h-full" /> : (titleFor(c).charAt(0))}
              {!c.is_group && <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full px-0.5">{online ? statusEmoji(peer) : "⚫"}</span>}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-900 truncate">{titleFor(c)}</p>
                <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(c.last_message_at)}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{c.last_message || "Say hello 👋"}</p>
            </div>
            {c.unread > 0 && (
              <span className="text-[10px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: FB }}>{c.unread}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}