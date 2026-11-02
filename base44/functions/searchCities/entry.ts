// City lookup for profile location entry. Two keyless sources are merged:
// Open-Meteo matches partially typed words ("portl" -> Portland) and Nominatim
// matches whole names ("walla" -> Walla Walla, Washington), so residents pick
// the real spelling instead of typing a misspelled city by hand.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

const PLACE_TYPES = new Set([
  "city",
  "town",
  "village",
  "hamlet",
  "municipality",
  "administrative",
  "suburb",
  "locality",
]);

async function fromOpenMeteo(query: string) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(query) +
    "&count=15&language=en&format=json";
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return (data.results || [])
    .filter((place: any) => place?.name)
    .map((place: any) => ({
      id: String(place.id ?? place.name),
      name: place.name,
      label: [place.name, place.admin1, place.country].filter(Boolean).join(", "),
    }));
}

async function fromNominatim(query: string) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=15&accept-language=en&q=" +
    encodeURIComponent(query);
  const res = await fetch(url, {
    headers: { "User-Agent": "SocialKingdom/1.0 (https://socialkingdom.base44.app)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => []);
  return (Array.isArray(data) ? data : [])
    .filter((place: any) => place?.name && PLACE_TYPES.has(place.type))
    .map((place: any) => {
      const address = place.address || {};
      const region = address.state || address.region || address.county || "";
      const label = [place.name, region, address.country].filter(Boolean).join(", ");
      return { id: String(place.place_id ?? label), name: place.name, label };
    });
}

const NOISE = /county|airport|heliport|district|province|region/i;

function score(city: { name: string; label: string }, query: string) {
  const name = city.name.toLowerCase();
  const label = city.label.toLowerCase();
  const q = query.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // A name that continues after the typed word ("walla" -> Walla Walla) is the
  // most likely intent, ahead of shorter names that merely share the prefix.
  if (new RegExp(`^${q}\\s`).test(name)) return 5;
  if (new RegExp(`^${q}$`).test(name)) return 4;
  if (name.startsWith(q)) return 3;
  if (label.includes(q)) return 2;
  return 1;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = (body.query || "").toString().trim();
    if (query.length < 2 || query.length > 80) return Response.json({ cities: [] });

    const [openMeteo, nominatim] = await Promise.allSettled([
      fromOpenMeteo(query),
      fromNominatim(query),
    ]);

    const seen = new Set<string>();
    const merged: { id: string; name: string; label: string }[] = [];
    for (const result of [openMeteo, nominatim]) {
      if (result.status !== "fulfilled") continue;
      for (const city of result.value) {
        if (NOISE.test(city.name)) continue;
        const key = city.label.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(city);
      }
    }

    merged.sort((a, b) => score(b, query) - score(a, query));
    return Response.json({ cities: merged.slice(0, 8) });
  } catch (error) {
    return Response.json({ cities: [], error: error.message }, { status: 200 });
  }
}