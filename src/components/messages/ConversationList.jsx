import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getAllDrafts, createGroupConversation } from "@/lib/messaging";
import { usersByIds } from "@/lib/users";
import { toast } from "@/components/ui/use-toast";
import ConversationRow from "@/components/messages/ConversationRow";
import ConversationSelectBar from "@/components/messages/ConversationSelectBar";

const FB = "#1877f2";

export default function ConversationList({ me, onOpen, refreshKey, scope = "all", direction = "incoming", onGroupOpened }) {
  const [convs, setConvs] = useState([]);
  const [peers, setPeers] = useState({});
  const [friendIds, setFriendIds] = useState(new Set());
  const [clickmateIds, setClickmateIds] = useState(new Set());
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [localRefresh, setLocalRefresh] = useState(0);

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

      const peerMap = ids.size ? await usersByIds([...ids]) : {};
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
        const aAr = (a.archived_by_ids || []).includes(me.id);
        const bAr = (b.archived_by_ids || []).includes(me.id);
        if (aAr !== bAr) return aAr ? 1 : -1;
        if ((a.unread > 0) !== (b.unread > 0)) return a.unread > 0 ? -1 : 1;
        return new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0);
      });
      setConvs(withUnread);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [me?.id, refreshKey, localRefresh]);

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

  function reload() { setLocalRefresh((k) => k + 1); }

  async function archiveToggle(c) {
    const cur = c.archived_by_ids || [];
    const isAr = cur.includes(me.id);
    const next = isAr ? cur.filter((id) => id !== me.id) : [...cur, me.id];
    await base44.entities.Conversation.update(c.id, { archived_by_ids: next }).catch(() => {});
    toast({ title: isAr ? "Conversation unarchived" : "Conversation archived" });
    reload();
  }

  function startSelect(c) {
    setSelecting(true);
    setSelected([c.id]);
  }
  function toggleSelect(c) {
    setSelected((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]));
  }
  function exitSelect() { setSelecting(false); setSelected([]); }

  async function deleteSelected() {
    if (!selected.length) return;
    setBusy(true);
    try {
      await Promise.all(selected.map(async (id) => {
        const msgs = await base44.entities.Message.filter({ conversation_id: id }, { limit: 500 }).catch(() => ({ items: [] }));
        if (msgs.items?.length) await base44.entities.Message.deleteMany({ conversation_id: id }).catch(() => {});
        await base44.entities.Conversation.delete(id).catch(() => {});
      }));
      toast({ title: `Deleted ${selected.length} conversation${selected.length > 1 ? "s" : ""}` });
      exitSelect();
      reload();
    } catch (e) {
      toast({ title: "Could not delete", description: String(e.message || e) });
    } finally {
      setBusy(false);
    }
  }

  async function groupFromSelected() {
    if (!selected.length) return;
    setBusy(true);
    try {
      const peerIds = new Set();
      selected.forEach((id) => {
        const c = convs.find((x) => x.id === id);
        (c?.member_ids || []).forEach((mid) => mid !== me.id && peerIds.add(mid));
      });
      const members = [...peerIds].map((id) => ({ id }));
      if (!members.length) {
        toast({ title: "No other members to add" });
        setBusy(false);
        return;
      }
      const conv = await createGroupConversation(me, members);
      exitSelect();
      onGroupOpened?.(conv);
      reload();
    } catch (e) {
      toast({ title: "Could not create group", description: String(e.message || e) });
    } finally {
      setBusy(false);
    }
  }

  const filtered = convs.filter((c) => {
    const isAr = (c.archived_by_ids || []).includes(me.id);
    if (direction === "archived") return isAr;
    if (isAr) return false;
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
    const scopeLabel = scope === "clicks" ? "CliQs" : scope === "friends" ? "friends" : scope === "other" ? "other people" : scope;
    const msg = direction === "archived"
      ? "No archived conversations."
      : direction === "drafts"
        ? "No drafts."
        : direction === "sent"
          ? `No sent messages${scope === "all" ? "" : ` in ${scopeLabel}`}.`
          : `No incoming messages${scope === "all" ? "" : ` from ${scopeLabel}`}.`;
    return <div className="p-6 text-center text-sm text-gray-400">{msg}</div>;
  }

  return (
    <>
      {selecting && (
        <div className="sticky top-0 z-20 bg-white border-b px-3 py-2 flex items-center gap-2 shadow-sm">
          <span className="flex-1 text-sm font-semibold text-gray-900">Select chats ({selected.length})</span>
          <button onClick={exitSelect} className="text-sm text-gray-500">Done</button>
        </div>
      )}
      <div>
        {filtered.map((c) => (
          <ConversationRow
            key={c.id}
            conv={c}
            peer={peerFor(c)}
            title={titleFor(c)}
            avatar={avatarFor(c)}
            draftText={drafts[c.id]}
            selecting={selecting}
            isSelected={selected.includes(c.id)}
            direction={direction}
            me={me}
            onOpen={onOpen}
            onArchiveToggle={archiveToggle}
            onLongPress={startSelect}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>
      {selecting && (
        <ConversationSelectBar
          count={selected.length}
          onCancel={exitSelect}
          onDelete={deleteSelected}
          onGroup={groupFromSelected}
        />
      )}
      {busy && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl px-4 py-3 text-sm font-semibold text-gray-800">Working…</div>
        </div>
      )}
    </>
  );
}