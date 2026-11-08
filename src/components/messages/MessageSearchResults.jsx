import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/sk-image";
import { presenceBadge } from "@/lib/presence";
import PresenceBadge from "@/components/presence/PresenceBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import ClickPresenceBadge from "@/components/presence/ClickPresenceBadge";
import { useClickHosts } from "@/hooks/useClickHosts";
import { usersByIds, searchUsers } from "@/lib/users";

const FB = "#1877f2";

function matchesFilters(u, f) {
  if (f.city && !(u.location || "").toLowerCase().includes(f.city.toLowerCase())) return false;
  if (f.job && !(u.job || "").toLowerCase().includes(f.job.toLowerCase())) return false;
  if (f.company && !(u.company || "").toLowerCase().includes(f.company.toLowerCase())) return false;
  return true;
}

export default function MessageSearchResults({ me, query, scope, filters, onSelectFriend }) {
  const [people, setPeople] = useState([]);
  const [cliqs, setCliqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const hosts = useClickHosts(cliqs);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!query.trim()) { setPeople([]); setCliqs([]); return; }
      setLoading(true);
      const q = query.trim();
      const rx = { $regex: q, $options: "i" };

      if (scope === "friends") {
        const fr = await base44.entities.Friendship.filter({ user_id: me.id, status: "accepted", friend_name: rx }, { limit: 100 }).catch(() => ({ items: [] }));
        const ids = fr.items.map((f) => f.friend_id).filter(Boolean);
        const users = Object.values(await usersByIds(ids));
        const map = Object.fromEntries(users.map((u) => [u.id, u]));
        const merged = ids.map((id) => map[id] || { id, full_name: fr.items.find((f) => f.friend_id === id)?.friend_name, avatar_url: fr.items.find((f) => f.friend_id === id)?.friend_avatar, location: fr.items.find((f) => f.friend_id === id)?.friend_city });
        setPeople(merged.filter((u) => matchesFilters(u, filters)));
        setCliqs([]);
      } else if (scope === "clicks") {
        const mem = await base44.entities.ClickMembership.filter({ user_id: me.id }, { limit: 200 }).catch(() => ({ items: [] }));
        const ids = mem.items.map((m) => m.click_id).filter(Boolean);
        let all = [];
        if (ids.length) {
          const c = await base44.entities.Click.filter({ id: { $in: ids }, name: rx }, { limit: 100 }).catch(() => ({ items: [] }));
          all = c.items || [];
        }
        setCliqs(all);
        setPeople([]);
      } else {
        const u = await searchUsers(q, { limit: 100, excludeIds: [me.id] });
        let list = u.filter((x) => matchesFilters(x, filters));
        if (scope === "other") {
          const fr = await base44.entities.Friendship.filter({ user_id: me.id, status: "accepted" }, { limit: 200 }).catch(() => ({ items: [] }));
          const mem = await base44.entities.ClickMembership.filter({ user_id: me.id }, { limit: 200 }).catch(() => ({ items: [] }));
          const exclude = new Set([...fr.items.map((f) => f.friend_id), ...mem.items.map((m) => m.user_id)]);
          list = list.filter((x) => !exclude.has(x.id));
        }
        setPeople(list);
        setCliqs([]);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [query, scope, filters, me?.id]);

  if (!query.trim()) return null;
  if (loading) return <div className="p-6 text-center text-sm text-gray-400">Searching…</div>;

  return (
    <div className="divide-y divide-gray-100">
      {people.length === 0 && cliqs.length === 0 && (
        <p className="p-6 text-center text-sm text-gray-400">No results.</p>
      )}
      {cliqs.map((c) => (
        <button key={c.id} onClick={() => navigate(`/click/${c.id}`)} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 text-left">
          <span className="relative w-11 h-11 shrink-0">
            <span className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center text-sm font-bold" style={{ borderColor: FB + "55", background: FB + "22", color: FB }}>
              {c.avatar_url ? <Image src={c.avatar_url} fittingType="fill" className="w-full h-full" /> : (c.name?.charAt(0) || "C")}
            </span>
            <ClickPresenceBadge click={c} host={hosts[c.id]} className="-top-1 -right-1 text-xs" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{c.name}</p>
            <p className="text-xs text-gray-500">CliQ · {c.member_count || 0} members</p>
          </div>
        </button>
      ))}
      {people.map((u) => {
        return (
          <button key={u.id} onClick={() => onSelectFriend(u)} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 text-left">
            <span className="relative w-11 h-11 shrink-0">
              <span className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center text-sm font-bold" style={{ borderColor: FB + "55", background: FB + "22", color: FB }}>
                {u.avatar_url ? <Image src={u.avatar_url} fittingType="fill" className="w-full h-full" /> : (u.full_name?.charAt(0) || "?")}
              </span>
              <PresenceBadge badge={presenceBadge(u)} className="-top-1 -right-1 text-xs" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate flex items-center gap-1">
                <span className="truncate">{u.full_name || "User"}</span>
                <VerifiedBadge id={u.id} name={u.full_name} compact />
              </p>
              <p className="text-xs text-gray-500 truncate">{[u.location, u.job, u.company].filter(Boolean).join(" · ")}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}