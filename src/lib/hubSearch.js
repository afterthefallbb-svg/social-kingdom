import { base44 } from "@/api/base44Client";
import moment from "moment";
import { getCategory } from "@/lib/categories";
import { searchUsers } from "@/lib/users";

/* Every filter maps to a real, searchable entity in the app. */
export const SEARCH_FILTERS = [
  { id: "all", label: "All" },
  { id: "events", label: "Events" },
  { id: "people", label: "People" },
  { id: "cliqs", label: "CliQs" },
  { id: "artists", label: "Artists" },
  { id: "videos", label: "Videos" },
  { id: "groups", label: "Groups" },
  { id: "posts", label: "Posts" },
  { id: "listings", label: "Marketplace" },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const contains = (value) => ({ $regex: escapeRegex(value), $options: "i" });
const toItems = (res) => (Array.isArray(res) ? res : res?.items || []);
const itemsOf = (promise) => promise.then(toItems).catch(() => []);

async function searchEvents(term, limit, excludeArtists) {
  const query = { title: contains(term), visibility: { $ne: "personal" } };
  if (excludeArtists) query.category = { $ne: "artists" };
  const events = await itemsOf(base44.entities.Event.filter(query, { sort: "-created_date", limit }));
  return events.map((e) => ({
    id: `event-${e.id}`,
    kind: "Event",
    title: e.title,
    subtitle: e.start_time ? moment(e.start_time).format("MMM D · h:mm A") : e.address || "View event",
    image: e.image_url,
    emoji: getCategory(e.category).emoji,
    to: `/event/${e.id}`,
  }));
}

async function searchArtists(term, limit) {
  const events = await itemsOf(
    base44.entities.Event.filter({ title: contains(term), category: "artists", visibility: { $ne: "personal" } }, { sort: "-created_date", limit })
  );
  return events.map((e) => ({
    id: `artist-${e.id}`,
    kind: "Artist",
    title: e.title,
    subtitle: e.address || "Artist page",
    image: e.image_url,
    emoji: "🎤",
    to: `/event/${e.id}`,
  }));
}

// The User entity only supports list(), so people are matched on names here.
async function searchPeople(term, limit) {
  const users = await searchUsers(term, { limit }).catch(() => []);
  return users
    .filter((u) => u.full_name)
    .map((u) => ({
      id: `person-${u.id}`,
      kind: "Person",
      title: u.full_name,
      subtitle: "View profile · add friend",
      image: u.avatar_url,
      emoji: "👤",
      to: `/profile/${u.id}`,
    }));
}

async function searchCliqs(term, limit) {
  const clicks = await itemsOf(base44.entities.Click.filter({ name: contains(term) }, { sort: "-member_count", limit }));
  return clicks.map((c) => ({
    id: `cliq-${c.id}`,
    kind: "CliQ",
    title: c.name,
    subtitle: `${(c.member_count || 0).toLocaleString()} members`,
    image: c.avatar_url,
    emoji: "👥",
    to: `/clicks/${c.id}`,
  }));
}

async function searchVideos(term, limit) {
  const videos = await itemsOf(base44.entities.Video.filter({ caption: contains(term) }, { sort: "-created_date", limit }));
  return videos.map((v) => ({
    id: `video-${v.id}`,
    kind: "Video",
    title: v.caption || v.user_name || "Video",
    subtitle: v.user_name || "Stream",
    image: v.thumbnail,
    emoji: "🎬",
    video: v,
  }));
}

async function searchGroups(term, limit) {
  const groups = await itemsOf(base44.entities.Group.filter({ name: contains(term) }, { sort: "-member_count", limit }));
  return groups.map((g) => ({
    id: `group-${g.id}`,
    kind: "Group",
    title: g.name,
    subtitle: g.location || `${(g.member_count || 0).toLocaleString()} members`,
    image: g.header_image,
    emoji: "🏰",
    to: `/groups/${g.category}`,
  }));
}

async function searchPosts(term, limit) {
  const posts = await itemsOf(base44.entities.Post.filter({ content: contains(term) }, { sort: "-created_date", limit }));
  return posts.map((p) => ({
    id: `post-${p.id}`,
    kind: "Post",
    title: (p.content || "").slice(0, 80),
    subtitle: p.author_name ? `By ${p.author_name}` : "Feed post",
    image: p.image_url,
    emoji: "📝",
    to: "/feed",
  }));
}

async function searchListings(term, limit) {
  const listings = await itemsOf(base44.entities.Listing.filter({ title: contains(term) }, { sort: "-created_date", limit }));
  return listings.map((l) => ({
    id: `listing-${l.id}`,
    kind: "Marketplace",
    title: l.title,
    subtitle: l.price != null ? `$${Number(l.price).toLocaleString()}` : "For sale",
    image: l.image_url,
    emoji: "🛍️",
    to: `/listing/${l.id}`,
  }));
}

const SEARCHERS = {
  people: searchPeople,
  cliqs: searchCliqs,
  artists: searchArtists,
  videos: searchVideos,
  groups: searchGroups,
  posts: searchPosts,
  listings: searchListings,
};

/* Searches every entity type in one pass ("all") or just the chosen filter. */
export async function searchHub(term, filterId) {
  const q = term.trim();
  if (!q) return [];
  const ids = filterId === "all"
    ? ["events", "people", "cliqs", "artists", "videos", "groups", "posts", "listings"]
    : [filterId];
  const limit = filterId === "all" ? 6 : 40;
  const batches = await Promise.all(
    ids.map((id) => {
      if (id === "events") return searchEvents(q, limit, filterId === "all");
      return SEARCHERS[id] ? SEARCHERS[id](q, limit) : Promise.resolve([]);
    })
  );
  return batches.flat();
}