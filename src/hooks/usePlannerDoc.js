import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

// Loads and auto-saves one planner/project document for the current user by key.
export default function usePlannerDoc(key, initial) {
  const [data, setData] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef({ id: null, userId: null, timer: null, pending: null, chain: Promise.resolve() });

  useEffect(() => {
    let active = true;
    const r = ref.current;
    r.id = null;
    setData(initial);
    setLoaded(false);
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!active) return;
      r.userId = me?.id || null;
      if (me) {
        const res = await base44.entities.PlannerDoc.filter({ user_id: me.id, key }, { limit: 1 });
        if (!active) return;
        const doc = res.items[0];
        if (doc) {
          r.id = doc.id;
          setData({ ...initial, ...(doc.data || {}) });
        }
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
      clearTimeout(r.timer);
      if (r.pending) r.pending();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (next) => {
    setData(next);
    const r = ref.current;
    clearTimeout(r.timer);
    const save = () => {
      r.pending = null;
      if (!r.userId) return;
      r.chain = r.chain.then(async () => {
        if (r.id) await base44.entities.PlannerDoc.update(r.id, { data: next });
        else {
          const d = await base44.entities.PlannerDoc.create({ user_id: r.userId, key, data: next });
          r.id = d.id;
        }
      });
    };
    r.pending = save;
    r.timer = setTimeout(save, 700);
  };

  return [data, update, loaded];
}