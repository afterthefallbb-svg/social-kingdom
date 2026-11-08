import { listUsers } from "@/lib/users";

/* One shared, cached index of who is verified, built from the user list the app
   already loads. Every badge on screen reads from this single snapshot, so a
   person shows as verified next to their name everywhere at once. */

const EMPTY = { ids: new Set(), names: new Set() };
let snapshot = EMPTY;
const listeners = new Set();
let started = null;

function build(users) {
  const ids = new Set();
  const names = new Set();
  (users || []).forEach((u) => {
    if (!u?.selfie_verified) return;
    if (u.id) ids.add(u.id);
    if (u.full_name) names.add(u.full_name.trim().toLowerCase());
  });
  return { ids, names };
}

function emit() {
  listeners.forEach((fn) => fn());
}

export function loadVerified() {
  if (!started) {
    started = listUsers()
      .then((users) => {
        snapshot = build(users);
        emit();
        return snapshot;
      })
      .catch(() => snapshot);
  }
  return started;
}

export function getVerifiedSnapshot() {
  return snapshot;
}

export function subscribeVerified(cb) {
  listeners.add(cb);
  loadVerified();
  return () => listeners.delete(cb);
}

// A person who just verified themselves shows the badge immediately.
export function markVerified(user) {
  if (!user) return;
  const ids = new Set(snapshot.ids);
  const names = new Set(snapshot.names);
  if (user.id) ids.add(user.id);
  if (user.full_name) names.add(user.full_name.trim().toLowerCase());
  snapshot = { ids, names };
  emit();
}

export function isVerifiedUser(snap, { id, name } = {}) {
  if (!snap) return false;
  if (id && snap.ids.has(id)) return true;
  if (name && snap.names.has(name.trim().toLowerCase())) return true;
  return false;
}