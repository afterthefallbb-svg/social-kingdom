import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Search, Check, Loader2, Lock, Users, UserPlus } from "lucide-react";
import { getCategory } from "@/lib/categories";
import { matchesName } from "@/lib/nameMatch";
import { searchUsers } from "@/lib/users";
import { NEON } from "@/lib/neonControls";

const FB = "#1877f2";
const TABS = [
  { id: "friends", label: "Friends", emoji: "👤" },
  { id: "cliqs", label: "CliQs", emoji: "👥" },
  { id: "afterparty", label: "After-party", emoji: "🎉" },
  { id: "search", label: "Search", emoji: "🔍" }
];

// Multi-select invite picker used inside Create Event. Same tabs/features as
// InviteDialog, but selections are collected and handed to the parent so
// invites can be sent after the event is posted. Reports selection as:
//   { users: [{id,name}], clicks: [{id,name}], events: [{id,name}] }
export default function InvitePicker({ onChange }) {
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [friendIds, setFriendIds] = useState(new Set());
  const [fofIds, setFofIds] = useState(new Set());
  const [selUsers, setSelUsers] = useState(new Map()); // id -> name
  const [selClicks, setSelClicks] = useState(new Set());
  const [selEvents, setSelEvents] = useState(new Set());

  useEffect(() => {
    let active = true;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!active) return;
      setMe(u);
      if (!u) return;
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

      const evs = await base44.entities.Event
        .filter({ visibility: "public" }, { sort: "start_time", limit: 50 })
        .catch(() => ({ items: [] }));
      const now = Date.now();
      if (!active) return;
      setNearby(
        evs.items.filter((e) => (!e.start_time || new Date(e.start_time).getTime() >= now))
      );
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Server-side name search only on the "Search" tab.
  useEffect(() => {
    if (tab !== "search") return;
    const q = query.trim();
    if (!q) { setResults([]); return; }
    let active = true;
    setSearching(true);
    (async () => {
      const users = await searchUsers(q, { limit: 30, excludeIds: [me?.id], filter: canInvite });
      if (active) {
        setResults(users);
        setSearching(false);
      }
    })();
    return () => { active = false; };
  }, [query, me?.id, tab]);

  // Push the current selection up to the parent whenever it changes.
  useEffect(() => {
    if (!onChange) return;
    onChange({
      users: [...selUsers.entries()].map(([id, name]) => ({ id, name })),
      clicks: [...selClicks].map((id) => {
        const c = clicks.find((x) => x.id === id);
        return { id, name: c?.name || "" };
      }),
      events: [...selEvents].map((id) => {
        const e = nearby.find((x) => x.id === id);
        return { id, name: e?.title || "" };
      })
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selUsers, selClicks, selEvents]);

  const toggleUser = (id, name) =>
    setSelUsers((m) => {
      const next = new Map(m);
      if (next.has(id)) next.delete(id); else next.set(id, name || "");
      return next;
    });
  const toggleClick = (id) =>
    setSelClicks((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const toggleEvent = (id) =>
    setSelEvents((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const canInvite = (u) => u.public_profile !== false || friendIds.has(u.id) || fofIds.has(u.id);
  const initial = (n) => (n ? n.charAt(0).toUpperCase() : "?");
  const totalSelected = selUsers.size + selClicks.size + selEvents.size;

  // Local fuzzy filtering for the friends / cliqs / after-party lists.
  const q = query.trim();
  const friendsFiltered = q ? friends.filter((f) => matchesName(f.friend_name, q)) : friends;
  const clicksFiltered = q ? clicks.filter((c) => matchesName(c.name, q)) : clicks;
  const nearbyFiltered = q ? nearby.filter((e) => matchesName(e.title, q)) : nearby;

  const SearchBar = () => (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          tab === "friends" ? "Search your friends"
          : tab === "cliqs" ? "Search your CliQs"
          : tab === "afterparty" ? "Search nearby events"
          : "Search people by name"
        }
        className="pl-9"
        style={NEON.field}
      />
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <UserPlus size={16} style={{ color: FB }} />
          <span className="text-sm font-semibold text-gray-700">Invite people</span>
        </div>
        <span className="text-xs font-medium" style={{ color: FB }}>
          {totalSelected} selected
        </span>
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTab(t.id); setQuery(""); }}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium"
              style={on ? NEON.on : { ...NEON.chip, border: `1px solid ${NEON.chip.borderColor}` }}
            >
              <span className="mr-1">{t.emoji}</span>{t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2"><SearchBar /></div>

      <div className="max-h-64 overflow-y-auto mt-2 space-y-2">
        {busy && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: FB }} />
          </div>
        )}

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
                  onClick={() => toggleUser(f.friend_id, f.friend_name)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg border text-left"
                  style={{
                    borderColor: on ? NEON.solid : "#9cc7ff",
                    background: on ? NEON.soft : "#f7fbff",
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
                    background: on ? NEON.soft : "#f7fbff",
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

        {tab === "afterparty" &&
          (nearby.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming public events nearby.</p>
          ) : nearbyFiltered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No events match “{q}”.</p>
          ) : (
            nearbyFiltered.map((ev) => {
              const cat = getCategory(ev.category);
              const on = selEvents.has(ev.id);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggleEvent(ev.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg border text-left"
                  style={{
                    borderColor: on ? NEON.solid : "#9cc7ff",
                    background: on ? NEON.soft : "#f7fbff",
                    boxShadow: on ? "0 2px 10px rgba(26,115,255,0.25)" : "none",
                  }}
                >
                  <span className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-lg shrink-0">
                    {ev.image_url ? <Image src={ev.image_url} fittingType="fill" className="w-full h-full" /> : cat.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                    <p className="text-[11px] text-gray-400 truncate">{cat.emoji} {ev.address || "Location"}</p>
                  </div>
                  {on ? <Check size={16} style={{ color: FB }} /> : (
                    <span className="text-[11px] font-semibold" style={{ color: FB }}>Invite attendees</span>
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
              const allowed = canInvite(u);
              const on = selUsers.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg border" style={{
                    borderColor: on ? NEON.solid : "#9cc7ff",
                    background: on ? NEON.soft : "#f7fbff",
                    boxShadow: on ? "0 2px 10px rgba(26,115,255,0.25)" : "none",
                  }}>
                  <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                    {u.avatar_url ? <Image src={u.avatar_url} fittingType="fill" className="w-full h-full" /> : initial(u.full_name)}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{u.full_name || "User"}</span>
                  {allowed ? (
                    <button type="button" onClick={() => toggleUser(u.id, u.full_name)} className="p-1">
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
              You can invite people with public profiles, your friends, or friends of friends.
            </p>
          </>
        )}
      </div>
    </div>
  );
}