import { base44 } from "@/api/base44Client";

export function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator?.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  });
}

export async function seedLocalEventsForUser() {
  const loc = await getUserLocation();
  if (!loc) return { seeded: false, firstInArea: false };
  try {
    const res = await base44.functions.invoke("seedLocalEvents", {
      ...loc,
      timezone_offset: -new Date().getTimezoneOffset(),
    });
    return res?.data || { seeded: false, firstInArea: false };
  } catch {
    return { seeded: false, firstInArea: false };
  }
}