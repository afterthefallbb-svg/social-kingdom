import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function useSocialHub() {
  const [me, setMe] = useState(null);
  const [events, setEvents] = useState([]);
  const [artists, setArtists] = useState([]);
  const [videos, setVideos] = useState([]);
  const [clicks, setClicks] = useState([]);
  useEffect(() => {
    let active = true;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!active) return;
      setMe(u);
      try {
        const agg = await base44.entities.Attendance.aggregate({ groupBy: "event_id", count: true, sort: "-count", limit: 10 });
        const ids = (agg.rows || []).map((r) => r.event_id).filter(Boolean);
        let evs = [];
        if (ids.length) {
          const res = await base44.entities.Event.filter({ id: { $in: ids }, visibility: { $ne: "personal" } }, { limit: 50 });
          evs = res.items;
          const order = new Map(ids.map((id, i) => [id, i]));
          evs.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
        } else {
          const res = await base44.entities.Event.filter({ visibility: { $ne: "personal" } }, { sort: "-created_date", limit: 10 });
          evs = res.items;
        }
        if (active) setEvents(evs);
      } catch {
        if (active) setEvents([]);
      }
      try {
        const res = await base44.entities.Event.filter({ category: "artists", visibility: { $ne: "personal" } }, { sort: "-created_date", limit: 10 });
        if (active) setArtists(res.items);
      } catch {
        if (active) setArtists([]);
      }
      try {
        const res = await base44.entities.Video.filter({}, { sort: "-created_date", limit: 20 });
        if (active) setVideos(res.items);
      } catch {
        if (active) setVideos([]);
      }
      try {
        const res = await base44.entities.Click.filter({}, { sort: "-member_count", limit: 10 });
        if (active) setClicks(res.items);
      } catch {
        if (active) setClicks([]);
      }
    })();
    return () => { active = false; };
  }, []);
  return { me, events, artists, videos, clicks };
}