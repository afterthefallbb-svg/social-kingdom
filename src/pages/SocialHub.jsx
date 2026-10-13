import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import { Image } from "@/components/ui/image";
import CategoryRow from "@/components/hub/CategoryRow";
import { STREAM_SAMPLES, EVENT_SAMPLES, ARTIST_SAMPLES, CLIQ_SAMPLES } from "@/lib/hubSamples";

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

  // Sample tiles with realistic photos fill each row so the hub looks fully populated.
  const pad = (items, samples, to, prefix, isVideo = false) => [
    ...items.map((i) => ({ ...i, isVideo })),
    ...samples
      .slice(0, Math.max(0, 10 - items.length))
      .map((s, i) => ({ ...s, id: `${prefix}-${i}`, isVideo, onClick: () => navigate(to) })),
  ];
  const videoItemsP = pad(videoItems, STREAM_SAMPLES, "/browse/videos", "s", true);
  const eventItemsP = pad(eventItems, EVENT_SAMPLES, "/browse/events", "e");
  const artistItemsP = pad(artistItems, ARTIST_SAMPLES, "/browse/artists", "a");
  const clickItemsP = pad(clickItems, CLIQ_SAMPLES, "/browse/cliqs", "c");

  const topLinks = [
    { label: "Notifications", to: "/notifications" },
    { label: "Groups", to: "/groups" },
    { label: "Buy/Sell", to: "/buy-sell" },
    { label: "Music", to: "/music" },
  ];

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Projects | Planner toggles */}
      <div className="flex gap-2 px-4 pt-5">
        {[{ l: "Projects", to: "/projects" }, { l: "Planner", to: "/planner" }].map((t) => (
          <button
            key={t.l}
            onClick={() => navigate(t.to)}
            className="flex-1 rounded-full py-2 text-sm font-semibold text-white"
            style={{ background: FB }}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Header: profile photo with name under it, search bar fills the rest */}
      <div className="flex items-center gap-3 px-4 pt-3">
        <div className="flex flex-col items-center gap-1 shrink-0 w-16">
          <button onClick={() => navigate("/profile")}>
            <span className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-xl bg-gray-100">
              {me?.avatar_url ? (
                <Image src={me.avatar_url} fittingType="fill" className="w-full h-full" />
              ) : (
                "🙂"
              )}
            </span>
          </button>
          <button onClick={() => navigate("/profile")} className="w-full">
            <span className="text-[11px] font-semibold text-gray-700 truncate w-full block text-center">
              {me?.full_name || me?.email || "You"}
            </span>
          </button>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex-1 flex items-center bg-gray-100 rounded-full px-3 h-12"
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

      {/* Category rows — Stream first, then Events */}
      <div className="mt-6 space-y-5">
        <CategoryRow
          title="Stream"
          onTitle={() => navigate("/browse/videos")}
          items={videoItemsP}
          emptyText="No videos yet."
        />
        <CategoryRow
          title="Events"
          onTitle={() => navigate("/browse/events")}
          items={eventItemsP}
          emptyText="No events in your area yet."
        />
        <CategoryRow
          title="Artist's"
          onTitle={() => navigate("/browse/artists")}
          items={artistItemsP}
          emptyText="No local artists yet."
        />
        <CategoryRow
          title="Cliq's"
          onTitle={() => navigate("/browse/cliqs")}
          items={clickItemsP}
          emptyText="No CliQs yet."
        />
      </div>

      {/* Footer links */}
      <div className="mt-10 flex justify-center gap-8 pb-4 text-xs">
        <Link to="/support" className="font-medium" style={{ color: FB }}>Support</Link>
        <Link to="/contact" className="font-medium" style={{ color: FB }}>Contact Us</Link>
      </div>
    </div>
  );
}