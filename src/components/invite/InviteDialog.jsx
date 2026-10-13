import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { X, Search, Send, Check, Loader2, Lock } from "lucide-react";
import { getCategory } from "@/lib/categories";

const FB = "#1877f2";
const TABS = [
  { id: "friends", label: "Friends", emoji: "👤" },
  { id: "cliqs", label: "CliQs", emoji: "👥" },
  { id: "afterparty", label: "After-party", emoji: "🎉" },
  { id: "search", label: "Search", emoji: "🔍" }
];

export default function InviteDialog({ event, onClose }) {
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(new Set());
  const [friendIds, setFriendIds] = useState(new Set());
  const [fofIds, setFofIds] = useState(new Set());
  const [note, setNote] = useState("");

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setMe(u);
      if (!u) return;
      const fr = await base44.entities.Friendship
        .filter({ user_id: u.id, status: "accepted" }, { limit: 200 })
        .catch(() => ({ items: [] }));
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
      setFofIds(fof);

      const mem = await base44.entities.ClickMembership
        .filter({ user_id: u.id }, { limit: 100 })
        .catch(() => ({ items: [] }));
      const cids = mem.items.map((m) => m.click_id).filter(Boolean);
      let cls = [];
      if (cids.length) {
        cls = (await base44.entities.Click.filter({ id: { $in: cids } }, { limit: 100 }).catch(() => ({ items: [] }))).items;
      }
      setClicks(cls);

      const evs = await base44.entities.Event
        .filter({ visibility: "public" }, { sort: "start_time", limit: 50 })
        .catch(() => ({ items: [] }));
      const now = Date.now();
      setNearby(
        evs.items.filter(
          (e) => e.id !== event.id && (!e.start_time || new Date(e.start_time).getTime() >= now)
        )
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    (async () => {
      const res = await base44.entities.User
        .filter({ full_name: { $regex: q, $options: "i" } }, { limit: 30 })
        .catch(() => ({ items: [] }));
      if (active) {
        setResults(res.items.filter((r) => r.id !== me?.id));
        setSearching(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [query, me?.id]);

  async function sendInvite(inviteeId, inviteeName) {
    if (!me || !inviteeId || sent.has(inviteeId)) return;
    try {
      await base44.entities.Invite.create({
        target_type: "event",
        target_id: event.id,
        target_name: event.title,
        target_image: event.image_url || "",
        target_category: event.category,
        target_address: event.address || "",
        inviter_id: me.id,
        inviter_name: me.full_name || "",
        invitee_id: inviteeId,
        invitee_name: inviteeName || ""
      });
      setSent((s) => new Set([...s, inviteeId]));
    } catch {
      /* ignore duplicates */
    }
  }

  async function inviteClick(click) {
    if (busy) return;
    setBusy(true);
    try {
      const mem = await base44.entities.ClickMembership
        .filter({ click_id: click.id }, { limit: 200 })
        .catch(() => ({ items: [] }));
      for (const m of mem.items) {
        if (m.user_id && m.user_id !== me.id) await sendInvite(m.user_id, m.user_name);
      }
      setNote(`Invited members of ${click.name}`);
    } finally {
      setBusy(false);
    }
  }

  async function inviteAttendees(ev) {
    if (busy) return;
    setBusy(true);
    try {
      const att = await base44.entities.Attendance
        .filter({ event_id: ev.id }, { limit: 200 })
        .catch(() => ({ items: [] }));
      for (const a of att.items) {
        if (a.user_id && a.user_id !== me.id) await sendInvite(a.user_id, a.user_name);
      }
      setNote(`Invited attendees of ${ev.title}`);
    } finally {
      setBusy(false);
    }
  }

  const canInvite = (u) => u.public_profile !== false || friendIds.has(u.id) || fofIds.has(u.id);

  const initial = (n) => (n ? n.charAt(0).toUpperCase() : "?");

  return (
    <div className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-bold text-gray-900">Invite to</h3>
            <p className="text-sm text-gray-500 truncate max-w-[260px]">{event?.title}</p>
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
                onClick={() => setTab(t.id)}
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium"
                style={{ background: on ? FB : "#eef2f7", color: on ? "#fff" : "#1f2937" }}
              >
                <span className="mr-1">{t.emoji}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {note && <p className="px-4 pt-2 text-xs font-medium" style={{ color: FB }}>{note}</p>}

        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {busy && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: FB }} />
            </div>
          )}

          {tab === "friends" &&
            (friends.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No friends yet.</p>
            ) : (
              friends.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                  <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                    {f.friend_avatar ? <Image src={f.friend_avatar} fittingType="fill" className="w-full h-full" /> : initial(f.friend_name)}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{f.friend_name}</span>
                  {sent.has(f.friend_id) ? (
                    <span className="text-xs font-semibold flex items-center gap-1" style={{ color: FB }}>
                      <Check size={14} /> Sent
                    </span>
                  ) : (
                    <button onClick={() => sendInvite(f.friend_id, f.friend_name)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: FB }}>
                      <Send size={13} className="inline -mt-0.5" /> Invite
                    </button>
                  )}
                </div>
              ))
            ))}

          {tab === "cliqs" &&
            (clicks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">You're not in any CliQs yet.</p>
            ) : (
              clicks.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                  <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                    {c.avatar_url ? <Image src={c.avatar_url} fittingType="fill" className="w-full h-full" /> : initial(c.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-[11px] text-gray-400">{c.member_count || 0} members</p>
                  </div>
                  <button onClick={() => inviteClick(c)} disabled={busy} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: FB }}>
                    Invite all
                  </button>
                </div>
              ))
            ))}

          {tab === "afterparty" &&
            (nearby.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No upcoming public events nearby.</p>
            ) : (
              nearby.map((ev) => {
                const cat = getCategory(ev.category);
                return (
                  <div key={ev.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                    <span className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-lg shrink-0">
                      {ev.image_url ? <Image src={ev.image_url} fittingType="fill" className="w-full h-full" /> : cat.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                      <p className="text-[11px] text-gray-400 truncate">{cat.emoji} {ev.address || "Location"}</p>
                    </div>
                    <button onClick={() => inviteAttendees(ev)} disabled={busy} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: FB }}>
                      Invite attendees
                    </button>
                  </div>
                );
              })
            ))}

          {tab === "search" && (
            <>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people by name" className="pl-9" autoFocus />
              </div>
              {searching && (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: FB }} />
                </div>
              )}
              {!searching && query && results.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No one found.</p>
              )}
              {results.map((u) => {
                const allowed = canInvite(u);
                return (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                    <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                      {u.avatar_url ? <Image src={u.avatar_url} fittingType="fill" className="w-full h-full" /> : initial(u.full_name)}
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{u.full_name || "User"}</span>
                    {sent.has(u.id) ? (
                      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: FB }}>
                        <Check size={14} /> Sent
                      </span>
                    ) : allowed ? (
                      <button onClick={() => sendInvite(u.id, u.full_name)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: FB }}>
                        <Send size={13} className="inline -mt-0.5" /> Invite
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Lock size={12} /> Private
                      </span>
                    )}
                  </div>
                );
              })}
              <p className="text-[11px] text-gray-400 px-1 pt-1">
                You can invite people with public profiles, your friends, or friends of friends.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}