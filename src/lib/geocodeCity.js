/* Turn a typed city or zip code into a map center. Runs in the browser so a
   visitor without an account can still move the map to their own area. */

function label(place, fallback) {
  return [place.name || fallback, place.address?.state || place.admin1].filter(Boolean).join(", ");
}

export async function geocodeCity(query) {
  const q = (query || "").trim();
  if (q.length < 2) return null;

  // Nominatim understands zip codes as well as city names.
  try {
    const res = await fetch(
      "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&accept-language=en&q=" +
        encodeURIComponent(q)
    );
    if (res.ok) {
      const rows = await res.json();
      const hit = Array.isArray(rows) ? rows[0] : null;
      if (hit?.lat && hit?.lon) {
        return { lat: Number(hit.lat), lng: Number(hit.lon), label: label(hit, q) };
      }
    }
  } catch {
    // fall through to the second source
  }

  try {
    const res = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
        encodeURIComponent(q) +
        "&count=1&language=en&format=json"
    );
    if (!res.ok) return null;
    const data = await res.json();
    const hit = (data.results || [])[0];
    if (!hit) return null;
    return { lat: hit.latitude, lng: hit.longitude, label: label(hit, q) };
  } catch {
    return null;
  }
}