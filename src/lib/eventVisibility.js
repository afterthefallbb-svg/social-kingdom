import { base44 } from "@/api/base44Client";

// All of a user's accepted friend IDs, in either direction of the Friendship record.
export async function getFriendIdsBothDirections(userId) {
  if (!userId) return [];
  const [mine, theirs] = await Promise.all([
    base44.entities.Friendship.filter({ user_id: userId, status: "accepted" }, { limit: 500 }).catch(() => ({ items: [] })),
    base44.entities.Friendship.filter({ friend_id: userId, status: "accepted" }, { limit: 500 }).catch(() => ({ items: [] })),
  ]);
  const ids = new Set();
  mine.items.forEach((f) => f.friend_id && ids.add(f.friend_id));
  theirs.items.forEach((f) => f.user_id && ids.add(f.user_id));
  return [...ids];
}

// When a user gains a friend, let that friend see all of the user's personal events
// by adding their id to each event's `visible_to` allowlist.
export async function addFriendToMyPersonalEvents(meId, friendId) {
  if (!meId || !friendId) return;
  const res = await base44.entities.Event
    .filter({ visibility: "personal", created_by_id: meId }, { limit: 200 })
    .catch(() => ({ items: [] }));
  for (const e of res.items || []) {
    const current = Array.isArray(e.visible_to) ? e.visible_to : [];
    if (current.includes(friendId)) continue;
    await base44.entities.Event.update(e.id, { visible_to: [...current, friendId] }).catch(() => {});
  }
}