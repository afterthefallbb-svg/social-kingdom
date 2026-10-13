import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import KloutBreakdown from "./KloutBreakdown";

const REACTIONS = [
  { id: "thumbs", emoji: "👍", label: "Like", value: 1 },
  { id: "horns", emoji: "🤘", label: "Rock on", value: 2 },
  { id: "crown", emoji: "👑", label: "Crown", value: 5 },
];
const valueOf = (r) => (REACTIONS.find((x) => x.id === r) || {}).value || 0;

export default function KloutButton({ target_type, target_id, size = "md" }) {
  const [me, setMe] = useState(null);
  const [mine, setMine] = useState(null);
  const [counts, setCounts] = useState({ thumbs: 0, horns: 0, crown: 0 });
  const [total, setTotal] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [breakdown, setBreakdown] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  async function load() {
    const user = await base44.auth.me().catch(() => null);
    setMe(user);
    const agg = await base44.entities.Klout.aggregate({
      query: { target_id, target_type },
      groupBy: "reaction",
      sum: ["value"],
    }).catch(() => ({ rows: [] }));
    const c = { thumbs: 0, horns: 0, crown: 0 };
    let t = 0;
    (agg.rows || []).forEach((row) => {
      c[row.reaction] = row.count || 0;
      t += row.sum_value || 0;
    });
    setCounts(c);
    setTotal(t);
    if (user) {
      const my = await base44.entities.Klout.filter(
        { target_id, target_type, user_id: user.id },
        { limit: 1 }
      ).catch(() => ({ items: [] }));
      setMine(my.items[0] || null);
    }
  }

  useEffect(() => {
    if (!target_id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target_id, target_type]);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  async function react(rid) {
    if (!me || busy) return;
    setBusy(true);
    setMenuOpen(false);
    try {
      if (mine && mine.reaction === rid) {
        await base44.entities.Klout.delete(mine.id);
        setMine(null);
      } else if (mine) {
        const updated = await base44.entities.Klout.update(mine.id, {
          reaction: rid,
          value: valueOf(rid),
        });
        setMine(updated);
      } else {
        const created = await base44.entities.Klout.create({
          target_type,
          target_id,
          user_id: me.id,
          user_name: me.full_name || "",
          user_avatar: me.avatar_url || "",
          reaction: rid,
          value: valueOf(rid),
        });
        setMine(created);
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  const myReaction = REACTIONS.find((r) => r.id === mine?.reaction);
  const pad = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";
  const txt = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={ref}>
      <button
        type="button"
        onClick={() => setBreakdown(true)}
        className={`inline-flex items-center gap-1 rounded-full ${pad} bg-amber-50 border border-amber-200 ${txt} font-semibold text-amber-700`}
        title="View Klout"
      >
        👑 <span>{total}</span>
      </button>

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className={`inline-flex items-center gap-1 rounded-full ${pad} bg-gray-100 border border-gray-200 ${txt} font-semibold text-gray-700`}
      >
        {myReaction ? (
          <>
            {myReaction.emoji} {myReaction.label}
          </>
        ) : (
          <>👍 Klout</>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-44">
          {REACTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => react(r.id)}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                mine?.reaction === r.id ? "text-blue-600 font-semibold" : "text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{r.emoji}</span> {r.label}
              </span>
              <span className="text-xs text-gray-400">+{r.value}</span>
            </button>
          ))}
        </div>
      )}

      {breakdown && (
        <KloutBreakdown
          target_type={target_type}
          target_id={target_id}
          counts={counts}
          total={total}
          onClose={() => setBreakdown(false)}
        />
      )}
    </div>
  );
}