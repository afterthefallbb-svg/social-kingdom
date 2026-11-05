import React, { useEffect, useState, useRef } from "react";
import { ThumbsUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import KloutBreakdown from "./KloutBreakdown";

const FB = "#1877f2";

const REACTIONS = [
  { id: "thumbs", emoji: "👍", label: "Like", value: 1 },
  { id: "horns", emoji: "🤘", label: "Super like", value: 2 },
  { id: "crown", emoji: "👑", label: "Crown", value: 3 },
];
const valueOf = (r) => (REACTIONS.find((x) => x.id === r) || {}).value || 0;

export default function KloutButton({ target_type, target_id, size = "md", page, menuAlign = "left" }) {
  const [me, setMe] = useState(null);
  const [mine, setMine] = useState(null);
  const [counts, setCounts] = useState({ thumbs: 0, horns: 0, crown: 0 });
  const [total, setTotal] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [breakdown, setBreakdown] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const holdTimer = useRef(null);
  const openedByHold = useRef(false);

  async function load() {
    const user = await base44.auth.me().catch(() => null);
    setMe(user);
    const c = { thumbs: 0, horns: 0, crown: 0 };
    let t = 0;
    if (page) {
      try {
        const res = await base44.functions.invoke("getPageKlout", {
          page_type: page.page_type,
          page_id: page.page_id,
        });
        const d = res.data || {};
        setTotal(d.total || 0);
        setCounts(d.counts || c);
      } catch {
        setTotal(0);
        setCounts(c);
      }
    } else {
      const agg = await base44.entities.Klout.aggregate({
        query: { target_id, target_type },
        groupBy: "reaction",
        sum: ["value"],
      }).catch(() => ({ rows: [] }));
      (agg.rows || []).forEach((row) => {
        c[row.reaction] = row.count || 0;
        t += row.sum_value || 0;
      });
      setCounts(c);
      setTotal(t);
    }
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
  }, [target_id, target_type, JSON.stringify(page)]);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("touchstart", h);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("touchstart", h);
    };
  }, [menuOpen]);

  function openMenu() {
    setMenuOpen(true);
  }

  function onPointerDown() {
    openedByHold.current = false;
    holdTimer.current = setTimeout(() => {
      openedByHold.current = true;
      openMenu();
    }, 380);
  }
  function clearHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }
  function onClick() {
    // A quick tap (not a hold) opens the reaction row too.
    if (!openedByHold.current) openMenu();
    openedByHold.current = false;
  }

  async function react(rid) {
    if (!me || busy) return;
    setBusy(true);
    setMenuOpen(false);

    // Paint the change immediately, then reconcile with the server.
    const removing = mine?.reaction === rid;
    const before = { mine, counts, total };
    const optimisticCounts = { ...counts };
    if (mine?.reaction) {
      optimisticCounts[mine.reaction] = Math.max(0, (optimisticCounts[mine.reaction] || 0) - 1);
    }
    if (!removing) optimisticCounts[rid] = (optimisticCounts[rid] || 0) + 1;
    setCounts(optimisticCounts);
    setTotal((t) => t - valueOf(mine?.reaction) + (removing ? 0 : valueOf(rid)));
    setMine(
      removing
        ? null
        : {
            ...(mine || {}),
            id: mine?.id || `optimistic-${rid}`,
            reaction: rid,
            value: valueOf(rid),
          }
    );

    try {
      if (mine && mine.reaction === rid) {
        // tapping the active reaction removes it
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
    } catch {
      // Roll the optimistic paint back to the last known server state.
      setMine(before.mine);
      setCounts(before.counts);
      setTotal(before.total);
    } finally {
      setBusy(false);
    }
  }

  const myReaction = REACTIONS.find((r) => r.id === mine?.reaction);
  const pad = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";
  const txt = size === "sm" ? "text-xs" : "text-sm";
  const iconSize = size === "sm" ? 15 : 17;

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={ref}>
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onClick={onClick}
        className={`inline-flex items-center gap-1 rounded-full ${pad} bg-gray-100 border border-gray-200 ${txt} font-semibold select-none`}
        style={{ color: myReaction ? FB : "#374151" }}
        aria-label="Like"
      >
        <ThumbsUp
          size={iconSize}
          fill={myReaction ? FB : "none"}
          color={myReaction ? FB : "#374151"}
        />
        {myReaction && <span>{myReaction.emoji}</span>}
      </button>

      <button
        type="button"
        onClick={() => setBreakdown(true)}
        className={`inline-flex items-center gap-1 ${txt} font-bold text-gray-800`}
        title="View clout"
      >
        <span>{total}</span>
        <span>👑</span>
      </button>

      {menuOpen && (
        <div className={`absolute top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-44 ${menuAlign === "right" ? "right-0" : "left-0"}`}>
          {REACTIONS.map((r) => {
            const active = mine?.reaction === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => react(r.id)}
                disabled={busy}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                  active ? "text-blue-600 font-semibold" : "text-gray-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{r.emoji}</span>{" "}
                  {active ? "Remove" : r.label}
                </span>
                <span className="text-xs text-gray-400">+{r.value}</span>
              </button>
            );
          })}
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