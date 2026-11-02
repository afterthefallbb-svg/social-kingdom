import { base44 } from "@/api/base44Client";

/*
 * The User entity does not support filter()/distinct() — those calls throw
 * "Not available for the User entity". list() and get(id) are the only read
 * paths, so every directory lookup in the app goes through here.
 */

const TTL = 15000;
let cache = null;
let cachedAt = 0;

export async function listUsers(force = false) {
  if (!force && cache && Date.now() - cachedAt < TTL) return cache;
  const users = await base44.entities.User.list().catch(() => []);
  cache = Array.isArray(users) ? users : [];
  cachedAt = Date.now();
  return cache;
}

export async function usersByIds(ids) {
  const wanted = [...new Set((ids || []).filter(Boolean))];
  if (!wanted.length) return {};
  const all = await listUsers();
  const byId = {};
  all.forEach((u) => {
    if (wanted.includes(u.id)) byId[u.id] = u;
  });
  const missing = wanted.filter((id) => !byId[id]);
  if (missing.length) {
    const found = await Promise.all(missing.map((id) => base44.entities.User.get(id).catch(() => null)));
    found.forEach((u) => {
      if (u?.id) byId[u.id] = u;
    });
  }
  return byId;
}

export async function getUser(id) {
  if (!id) return null;
  const all = await listUsers();
  const hit = all.find((u) => u.id === id);
  if (hit) return hit;
  return base44.entities.User.get(id).catch(() => null);
}

export async function searchUsers(term, { limit = 30, excludeIds = [], filter = null } = {}) {
  const q = (term || "").trim().toLowerCase();
  const exclude = new Set((excludeIds || []).filter(Boolean));
  const users = await listUsers(true);
  return users
    .filter((u) => u.id && !exclude.has(u.id))
    .filter((u) => u.public_profile !== false)
    .filter((u) => !q || (u.full_name || "").toLowerCase().includes(q))
    .filter((u) => (filter ? filter(u) : true))
    .slice(0, limit);
}