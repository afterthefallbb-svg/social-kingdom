import moment from "moment";
import { getCategory } from "@/lib/categories";
import { STREAM_SAMPLES, EVENT_SAMPLES, ARTIST_SAMPLES, CLIQ_SAMPLES, withSamples } from "@/lib/hubSamples";

export default function hubItems({ events, artists, videos, clicks, people = [], me }, navigate) {
  const mapEvent = (e) => ({ id: e.id, label: e.title, image: e.image_url, category: e.category, emoji: getCategory(e.category).emoji, meta: e.start_time ? moment(e.start_time).format("MMM D · h:mm A") : "View event", onClick: () => navigate(`/event/${e.id}`) });
  // Sample tiles top the row up to a full set; tapping one opens that category.
  const pad = (items, samples, to, prefix) =>
    withSamples(items, samples, prefix).map((r) => (r.isSample ? { ...r, onClick: () => navigate(to) } : r));
  return {
    stream: pad(videos.map((v) => ({ id: v.id, label: v.caption || v.user_name || "Video", image: v.thumbnail, emoji: "🎬", isVideo: true, author: v.user_name, avatar: v.user_avatar, time: v.created_date ? moment(v.created_date).fromNow() : "" })), STREAM_SAMPLES, "/browse/videos", "s"),
    events: pad(events.map(mapEvent), EVENT_SAMPLES, "/browse/events", "e"),
    artists: pad(artists.map((e) => ({ ...mapEvent(e), kind: "artists" })), ARTIST_SAMPLES, "/browse/artists", "a"),
    cliqs: pad(clicks.map((c) => ({ id: c.id, label: c.name, image: c.avatar_url, kind: "cliqs", emoji: "👥", meta: `${(c.member_count || 0).toLocaleString()} members`, onClick: () => navigate(`/clicks/${c.id}`) })), CLIQ_SAMPLES, "/browse/cliqs", "c"),
    // People already on the app — the first pass at recommended friends.
    people: people
      .filter((u) => u.id && u.id !== me?.id && u.public_profile !== false)
      .slice(0, 12)
      .map((u) => ({ id: u.id, label: u.full_name || "Member", image: u.avatar_url, kind: "friends", meta: u.location || "On Social Kingdom", onClick: () => navigate(`/profile/${u.id}`) })),
  };
}