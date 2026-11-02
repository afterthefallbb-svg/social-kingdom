import { base44 } from "@/api/base44Client";

export const RELATIONSHIP_TYPES = [
  "In a relationship",
  "Engaged",
  "Married",
  "Partnership",
  "Spouse",
  "In an open relationship",
  "It's complicated",
  "Separated",
  "Divorced"
];

const shape = (r, userId) => {
  const mine = r.requester_id === userId;
  return {
    id: r.id,
    type: r.relationship_type,
    partnerId: mine ? r.partner_id : r.requester_id,
    partnerName: mine ? r.partner_name : r.requester_name
  };
};

/* Everything relationship-related for one person: the confirmed status plus
   any request still waiting on an answer. */
export async function getRelationshipState(userId) {
  if (!userId) return { accepted: null, outgoing: null, incoming: null };
  const page = await base44.entities.Relationship
    .filter({ $or: [{ requester_id: userId }, { partner_id: userId }] }, { limit: 50 })
    .catch(() => ({ items: [] }));
  const items = page.items || [];
  const accepted = items.find((r) => r.status === "accepted");
  const outgoing = items.find((r) => r.status === "pending" && r.requester_id === userId);
  const incoming = items.find((r) => r.status === "pending" && r.partner_id === userId);
  return {
    accepted: accepted ? shape(accepted, userId) : null,
    outgoing: outgoing ? shape(outgoing, userId) : null,
    incoming: incoming ? shape(incoming, userId) : null
  };
}