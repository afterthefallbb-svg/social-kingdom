import { base44 } from "@/api/base44Client";

// A message is hidden from someone once their id sits in deleted_for_ids, which
// lets one person clear a message from their own history without touching the
// other person's copy.
export function visibleMessages(items, userId) {
  return (items || []).filter((m) => !(m.deleted_for_ids || []).includes(userId));
}

export async function deleteMessageForMe(message, userId) {
  const ids = message.deleted_for_ids || [];
  if (ids.includes(userId)) return;
  await base44.entities.Message.update(message.id, { deleted_for_ids: [...ids, userId] });
}

// Removes the record itself, so it disappears from every member's history.
export async function unsendMessage(message) {
  await base44.entities.Message.delete(message.id);
}