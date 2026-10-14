import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Bulk-fetches the host (creator) user for each click. Returns a map: clickId -> host user.
export function useClickHosts(clicks) {
  const [hosts, setHosts] = useState({});
  const key = (clicks || []).map((c) => `${c.id}:${c.created_by_id || ""}`).join(",");
  useEffect(() => {
    let active = true;
    (async () => {
      const list = clicks || [];
      const ids = list.map((c) => c.created_by_id).filter(Boolean);
      const uniq = [...new Set(ids)];
      if (!uniq.length) {
        setHosts({});
        return;
      }
      const res = await base44.entities.User.filter({ id: { $in: uniq } }, { limit: 200 }).catch(() => ({ items: [] }));
      if (!active) return;
      const byId = Object.fromEntries((res.items || []).map((u) => [u.id, u]));
      const map = {};
      list.forEach((c) => {
        if (c.created_by_id) map[c.id] = byId[c.created_by_id] || null;
      });
      setHosts(map);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return hosts;
}