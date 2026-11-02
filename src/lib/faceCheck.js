import { base44 } from "@/api/base44Client";

// Client helpers for the identity checks in the faceMatch backend function.
// Both are single, cheap calls: one for a profile photo, and a bounded one that
// compares the new selfie against existing verified accounts.

export async function checkDuplicateFace() {
  try {
    const res = await base44.functions.invoke("faceMatch", { mode: "duplicate" });
    const data = res?.data || {};
    return { duplicate: data.duplicate === true, reason: data.reason || "" };
  } catch {
    return { duplicate: false, reason: "" };
  }
}

export async function checkProfilePhoto(url) {
  if (!url) return { ok: true, reason: "" };
  try {
    const res = await base44.functions.invoke("faceMatch", { mode: "profile", url });
    const data = res?.data || {};
    return { ok: data.match !== false, reason: data.reason || "" };
  } catch {
    return { ok: true, reason: "" };
  }
}