import moment from "moment";
import { getCategory } from "@/lib/categories";
import { STREAM_SAMPLES, EVENT_SAMPLES, ARTIST_SAMPLES, CLIQ_SAMPLES } from "@/lib/hubSamples";

export default function hubItems({ events, artists, videos, clicks }, navigate) {
  const mapEvent = (e) => ({ id: e.id, label: e.title, image: e.image_url, emoji: getCategory(e.category).emoji, meta: e.start_time ? moment(e.start_time).format("MMM D · h:mm A") : "View event", onClick: () => navigate(`/event/${e.id}`) });
  const pad = (items, samples, to, prefix) => [...items, ...samples.slice(0, Math.max(0, 10 - items.length)).map((s, i) => ({ ...s, id: `${prefix}-${i}`, onClick: () => navigate(to) }))];
  return {
    stream: pad(videos.map((v) => ({ id: v.id, label: v.caption || v.user_name || "Video", image: v.thumbnail, emoji: "🎬", isVideo: true, author: v.user_name, avatar: v.user_avatar, time: v.created_date ? moment(v.created_date).fromNow() : "" })), STREAM_SAMPLES, "/browse/videos", "s"),
    events: pad(events.map(mapEvent), EVENT_SAMPLES, "/browse/events", "e"),
    artists: pad(artists.map(mapEvent), ARTIST_SAMPLES, "/browse/artists", "a"),
    cliqs: pad(clicks.map((c) => ({ id: c.id, label: c.name, image: c.avatar_url, emoji: "👥", meta: `${(c.member_count || 0).toLocaleString()} members`, onClick: () => navigate(`/clicks/${c.id}`) })), CLIQ_SAMPLES, "/browse/cliqs", "c"),
  };
}