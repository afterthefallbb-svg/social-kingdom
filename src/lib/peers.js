import { base44 } from "@/api/base44Client";
import { getUser } from "@/lib/users";

/*
 * A chat peer is usually an app user. The country's host profiles (Persona
 * records) also hold conversations, so every lookup falls back to them and
 * hands the rest of the messaging screens a user-shaped object.
 */
export function personaToPeer(p) {
  if (!p) return null;
  return {
    id: p.id,
    full_name: p.name,
    avatar_url: p.avatar_url,
    location: [p.city, p.state].filter(Boolean).join(", "),
    city: p.city,
    bio: p.bio,
    age: p.age,
    interests: p.interests || [],
    is_persona: true,
  };
}

export async function getChatPeer(id) {
  if (!id) return null;
  const user = await getUser(id).catch(() => null);
  if (user) return user;
  const persona = await base44.entities.Persona.get(id).catch(() => null);
  return persona ? personaToPeer(persona) : { id };
}

/* Resolve a batch of ids, app users first, then host profiles. */
export async function peersByIds(ids) {
  const wanted = [...new Set((ids || []).filter(Boolean))];
  if (!wanted.length) return {};
  const map = {};
  await Promise.all(
    wanted.map(async (id) => {
      const peer = await getChatPeer(id);
      if (peer) map[id] = peer;
    })
  );
  return map;
}