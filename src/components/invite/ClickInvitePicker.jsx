import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { X, Search, Check, Loader2, Lock, Send, Users } from "lucide-react";
import { matchesName } from "@/lib/nameMatch";
import { searchUsers } from "@/lib/users";
import { NEON } from "@/lib/neonControls";

const FB = "#1877f2";
const TABS = [
  { id: "friends", label: "Friends", emoji: "👤" },
  { id: "cliqs", label: "CliQs", emoji: "👥" },
  { id: "search", label: "Search", emoji: "🔍" }
];

// Multi-select invite picker for creating a CliQ. Tabs: Friends, CliQs you
// belong to, and public Search. Invitees are restricted to your friends or
// friends-of-friends. "Send" commits the current batch to the parent's
// running list, clears the selection, and closes so you can reopen and add
// more. Inviting a CliQ expands to its friend/fof members on send.
export default function ClickInvitePicker({ onSend, onClose }) {
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friendIds, setFriendIds] = useState(new Set());
  const [fofIds, setFofIds] = useState(new Set());
  const [selUsers, setSelUsers] = useState(new Map()); // id -> {name, avatar}
  const [selClicks, setSelClicks] = useState(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!active || !u) return;
      setMe(u);
      const fr = await base44.entities.Friendship
        .filter({ user_id: u.id, status: "accepted" }, { limit: 200 })
        .catch(() => ({ items: [] }));
      if (!active) return;
      setFriends(fr.items);
      const fids = new Set(fr.items.map((f) => f.friend_id).filter(Boolean));
      setFriendIds(fids);

      const fof = new Set();
      for (const fid of [...fids]) {
        const ff = await base44.entities.Friendship
          .filter({ user_id: fid, status: "accepted" }, { limit: 200 })
          .catch(() => ({ items: [] }));
        ff.items.forEach((x) => {
          if (x.friend_id && x.friend_id !== u.id) fof.add(x.friend_id);
        });
      }
      if (!active) return;
      setFofIds(fof);

      const mem = await base44.entities.ClickMembership
        .filter({ user_id: u.id }, { limit: 100 })
        .catch(() => ({ items: [] }));
      const cids = mem.items.map((m) => m.click_id).filter(Boolean);
      let cls = [];
      if (cids.length) {
        cls = (await base44.entities.Click.filter({ id: { $in: cids } }, { limit: 100 }).catch(() => ({ items: [] }))).items;
      }
      if (!active) return;
      setClicks(cls);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (tab !== "search") return;
    const q = query.trim();
    if (!q) { setResults([]); return; }
    let active = true;
    setSearching(true);
    (async () => {
      const users = await searchUsers(q, { limit: 30, excludeIds: [me?.id] });
      if (active) {
        setResults(users);
        setSearching(false);
      }
    })();
    return () => { active = false; };
  }, [query, me?.id, tab]);

  const canInvite = (id) => friendIds.has(id) || fofIds.has(id);
  const initial = (n) => (n ? n.charAt(0).toUpperCase() : "?");

  function toggleUser(u) {
    setSelUsers((m) => {
      const next = new Map(m);
      if (next.has(u.id)) next.delete(u.id);
      else next.set(u.id, { name: u.name, avatar: u.avatar });
      return next;
    });
  }
  function toggleClick(id) {
    setSelClicks((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSend() {
    if (sending) return;
    setSending(true);
    try {
      const list = [];
      const seen = new Set();
      selUsers.forEach((val, id) => {
        if (!seen.has(id)) { seen.add(id); list.push({ id, name: val.name, avatar: val.avatar }); }
      });
      for (const cid of selClicks) {
        const mem = await base44.entities.ClickMembership
          .filter({ click_id: cid }, { limit: 200 })
          .catch(() => ({ items: [] }));
        mem.items.forEach((m) => {
          if (m.user_id && m.user_id !== me.id && canInvite(m.user_id) && !seen.has(m.user_id)) {
            seen.add(m.user_id);
            list.push({ id: m.user_id, name: m.user_name, avatar: m.user_avatar });
          }
        });
      }
      if (list.length) onSend(list);
      setSelUsers(new Map());
      setSelClicks(new Set());
      setQuery("");
      onClose();
    } finally {
      setSending(false);
    }
  }

  const q = query.trim();
  const friendsFiltered = q ? friends.filter((f) => matchesName(f.friend_name, q)) : friends;
  const clicksFiltered = q ? clicks.filter((c) => matchesName(c.name, q)) : clicks;
  const totalSelected = selUsers.size + selClicks.size;

  return (
    <div className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-bold text-gray-900">Invite to your CliQ</h3>
            <p className="text-sm text-gray-500">Friends or friends of friends</p>
          </div>
          <button onClick={onClose} className="p-1" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-1 px-3 pt-3 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setQuery(""); }}
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium"
                style={on ? NEON.on : { ...NEON.chip, border: `1px solid ${NEON.chip.borderColor}` }}
              >
                <span className="mr-1">{t.emoji}</span>{t.label}
              </button>
            );
          })}
        </div>

        <div className="px-3 pt-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "friends" ? "Search your friends"
                : tab === "cliqs" ? "Search your CliQs"
                : "Search people by name"
              }
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {tab === "friends" &&
            (friends.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No friends yet.</p>
            ) : friendsFiltered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No friends match “{q}”.</p>
            ) : (
              friendsFiltered.map((f) => {
                const on = selUsers.has(f.friend_id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleUser({ id: f.friend_id, name: f.friend_name, avatar: f.friend_avatar })}
                    className="w-full flex items-center gap-3 p-2 rounded-lg border text-left"
                    style={{
                    borderColor: on ? NEON.solid : "#9cc7ff",
                    background: on ? NEON.chip.background : "#f7fbff",
                    boxShadow: on ? "0 2px 10px rgba(26,115,255,0.25)" : "none",
                  }}
                  >
                    <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                      {f.friend_avatar ? <Image src={f.friend_avatar} fittingType="fill" className="w-full h-full" /> : initial(f.friend_name)}
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{f.friend_name}</span>
                    {on && <Check size={16} style={{ color: FB }} />}
                  </button>
                );
              })
            ))}

          {tab === "cliqs" &&
            (clicks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">You're not in any CliQs yet.</p>
            ) : clicksFiltered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No CliQs match “{q}”.</p>
            ) : (
              clicksFiltered.map((c) => {
                const on = selClicks.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClick(c.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg border text-left"
                    style={{
                    borderColor: on ? NEON.solid : "#9cc7ff",
                    background: on ? NEON.chip.background : "#f7fbff",
                    boxShadow: on ? "0 2px 10px rgba(26,115,255,0.25)" : "none",
                  }}
                  >
                    <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                      {c.avatar_url ? <Image src={c.avatar_url} fittingType="fill" className="w-full h-full" /> : initial(c.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1"><Users size={11} /> {c.member_count || 0} members</p>
                    </div>
                    {on ? <Check size={16} style={{ color: FB }} /> : (
                      <span className="text-[11px] font-semibold" style={{ color: FB }}>Select all</span>
                    )}
                  </button>
                );
              })
            ))}

          {tab === "search" && (
            <>
              {searching && (
                <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin" style={{ color: FB }} /></div>
              )}
              {!searching && query && results.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No one found.</p>
              )}
              {results.map((u) => {
                const allowed = canInvite(u.id);
                const on = selUsers.has(u.id);
                return (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg border" style={{
                    borderColor: on ? NEON.solid : "#9cc7ff",
                    background: on ? NEON.chip.background : "#f7fbff",
                    boxShadow: on ? "0 2px 10px rgba(26,115,255,0.25)" : "none",
                  }}>
                    <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                      {u.avatar_url ? <Image src={u.avatar_url} fittingType="fill" className="w-full h-full" /> : initial(u.full_name)}
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{u.full_name || "User"}</span>
                    {allowed ? (
                      <button type="button" onClick={() => toggleUser({ id: u.id, name: u.full_name, avatar: u.avatar_url })} className="p-1">
                        {on ? <Check size={16} style={{ color: FB }} /> : (
                          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: FB }}>Select</span>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1"><Lock size={12} /> Private</span>
                    )}
                  </div>
                );
              })}
              <p className="text-[11px] text-gray-400 px-1 pt-1">
                You can invite your friends or friends of friends.
              </p>
            </>
          )}
        </div>

        <div className="p-3 border-t">
          <button
            onClick={handleSend}
            disabled={sending || totalSelected === 0}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-40"
            style={{ background: FB }}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send {totalSelected > 0 ? `${totalSelected} invite${totalSelected > 1 ? "s" : ""}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}