import { base44 } from "@/api/base44Client";

// Find an existing direct (non-group) conversation between me and a peer, or create one.
export async function getOrCreateDirectConversation(me, peer) {
  if (!me?.id || !peer?.id) return null;
  const mine = await base44.entities.Conversation.filter({}, { limit: 200 }).catch(() => ({ items: [] }));
  const existing = mine.items.find(
    (c) => !c.is_group && c.member_ids?.length === 2 && c.member_ids.includes(me.id) && c.member_ids.includes(peer.id)
  );
  if (existing) return existing;
  return base44.entities.Conversation.create({
    is_group: false,
    member_ids: [me.id, peer.id],
    member_count: 2,
    created_by_id: me.id,
    last_message_at: new Date().toISOString(),
  });
}

export async function createGroupConversation(me, members, name) {
  const memberIds = Array.from(new Set([me.id, ...members.map((m) => m.id)]));
  return base44.entities.Conversation.create({
    is_group: true,
    name: name || `Group of ${memberIds.length}`,
    member_ids: memberIds,
    member_count: memberIds.length,
    created_by_id: me.id,
    last_message_at: new Date().toISOString(),
  });
}

export async function sendMessage(conversation, me, content) {
  const msg = await base44.entities.Message.create({
    conversation_id: conversation.id,
    sender_id: me.id,
    sender_name: me.full_name || "",
    sender_avatar: me.avatar_url || "",
    content,
  });
  await base44.entities.Conversation.update(conversation.id, {
    last_message: content,
    last_message_at: new Date().toISOString(),
  }).catch(() => {});
  return msg;
}

export async function markConversationRead(conversationId, meId) {
  const unread = await base44.entities.Message.filter(
    { conversation_id: conversationId, read: false, sender_id: { $ne: meId } },
    { limit: 100 }
  ).catch(() => ({ items: [] }));
  if (!unread.items?.length) return;
  await base44.entities.Message.bulkUpdate(
    unread.items.map((m) => ({ id: m.id, read: true }))
  ).catch(() => {});
}