import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import { Image } from "@/components/ui/image";
import CategoryRow from "@/components/hub/CategoryRow";

const FB = "#1877f2";

export default function SocialHub() {
  const navigate = useNavigate();
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

      // Events — most popular by attendance count, fall back to recent
      try {
        const agg = await base44.entities.Attendance.aggregate({
          groupBy: "event_id",
          count: true,
          sort: "-count",
          limit: 10,
        });
        const ids = (agg.rows || []).map((r) => r.event_id).filter(Boolean);
        let evs = [];
        if (ids.length) {
          const res = await base44.entities.Event.filter(
            { id: { $in: ids }, visibility: { $ne: "personal" } },
            { limit: 50 }
          );
          evs = res.items;
          const order = new Map(ids.map((id, i) => [id, i]));
          evs.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
        } else {
          const res = await base44.entities.Event.filter(
            { visibility: { $ne: "personal" } },
            { sort: "-created_date", limit: 10 }
          );
          evs = res.items;
        }
        if (active) setEvents(evs);
      } catch {
        setEvents([]);
      }

      // Artists — local musician events
      try {
        const res = await base44.entities.Event.filter(
          { category: "artists", visibility: { $ne: "personal" } },
          { sort: "-created_date", limit: 10 }
        );
        if (active) setArtists(res.items);
      } catch {
        setArtists([]);
      }

      // Videos — recent video media on the platform
      try {
        const res = await base44.entities.EventPhoto.filter(
          { type: "video" },
          { sort: "-created_date", limit: 10 }
        );
        if (active) setVideos(res.items);
      } catch {
        setVideos([]);
      }

      // Cliq's — most popular by member count
      try {
        const res = await base44.entities.Click.filter({}, { sort: "-member_count", limit: 10 });
        if (active) setClicks(res.items);
      } catch {
        setClicks([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const mapEvent = (e) => ({
    id: e.id,
    label: e.title,
    image: e.image_url,
    emoji: getCategory(e.category).emoji,
    onClick: () => navigate(`/event/${e.id}`),
  });
  const eventItems = events.map(mapEvent);
  const artistItems = artists.map(mapEvent);
  const videoItems = videos.map((v) => ({
    id: v.id,
    label: v.user_name,
    image: v.url,
    emoji: "🎬",
    onClick: () => (v.event_id ? navigate(`/event/${v.event_id}`) : null),
  }));
  const clickItems = clicks.map((c) => ({
    id: c.id,
    label: c.name,
    image: c.avatar_url,
    emoji: "👥",
    onClick: () => navigate(`/clicks/${c.id}`),
  }));

  const topLinks = [
    { label: "Music", to: "/browse/music" },
    { label: "Videos", to: "/browse/videos" },
    { label: "Shop-online", to: "/browse/shop" },
    { label: "Local Sale", to: "/browse/local-sale" },
  ];

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header: profile photo + name (tap → your profile), search box */}
      <div className="flex items-center gap-3 px-4 pt-6">
        <button onClick={() => navigate("/profile")} className="shrink-0">
          <span className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-xl bg-gray-100">
            {me?.avatar_url ? (
              <Image src={me.avatar_url} fittingType="fill" className="w-full h-full" />
            ) : (
              "🙂"
            )}
          </span>
        </button>
        <button onClick={() => navigate("/profile")} className="text-left">
          <span className="font-bold text-gray-900 text-sm block">
            {me?.full_name || me?.email || "You"}
          </span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-2 ml-2"
        >
          <Search size={16} className="text-gray-400 shrink-0" />
          <span className="ml-2 text-sm text-gray-400">search</span>
        </button>
      </div>

      {/* Top text links as blue bubbles */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto no-scrollbar">
        {topLinks.map((l) => (
          <button
            key={l.label}
            onClick={() => navigate(l.to)}
            className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ background: FB, color: "#e8edf3" }}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Category rows */}
      <div className="mt-6 space-y-5">
        <CategoryRow
          title="Events"
          onTitle={() => navigate("/browse/events")}
          items={eventItems}
          emptyText="No events in your area yet."
        />
        <CategoryRow
          title="Stream"
          onTitle={() => navigate("/browse/videos")}
          items={videoItems}
          emptyText="No videos yet."
        />
        <CategoryRow
          title="Artist's"
          onTitle={() => navigate("/browse/artists")}
          items={artistItems}
          emptyText="No local artists yet."
        />
        <CategoryRow
          title="Cliq's"
          onTitle={() => navigate("/browse/cliqs")}
          items={clickItems}
          emptyText="No CliQs yet."
        />
      </div>
    </div>
  );
}