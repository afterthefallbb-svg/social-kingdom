import { base44 } from "@/api/base44Client";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export function isOnline(user) {
  if (!user) return false;
  if (user.show_online === false) return false;
  if (!user.last_seen) return false;
  const t = new Date(user.last_seen).getTime();
  return Date.now() - t < ONLINE_WINDOW_MS;
}

export function statusEmoji(user) {
  return user?.status_emoji || "🤡";
}

// Returns { emoji, online } to render, or null when the user hides their status.
export function presenceBadge(user) {
  if (!user) return null;
  if (user.show_online === false) return null;
  return { emoji: statusEmoji(user), online: isOnline(user) };
}

// A CliQ shows its host's online emoji when both the host and the CliQ allow it.
export function clickPresenceBadge(click, host) {
  if (!click) return null;
  if (click.show_online === false) return null;
  if (!host) return null;
  if (host.show_online === false) return null;
  return { emoji: statusEmoji(host), online: isOnline(host) };
}

export function lastSeenLabel(user) {
  if (isOnline(user)) return "Active now";
  if (!user?.last_seen) return "Offline";
  const diff = Date.now() - new Date(user.last_seen).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}

export async function markOnline(me) {
  if (!me) return;
  try {
    await base44.auth.updateMe({ last_seen: new Date().toISOString() });
  } catch {
    /* ignore */
  }
}