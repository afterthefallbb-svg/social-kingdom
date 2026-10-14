// Builds a Google Maps directions URL that opens the Maps app / site with
// turn-by-turn directions to the event. Prefers coordinates (most precise),
// falls back to the street address when coords are missing or zeroed out.
export function eventDirectionsUrl(event) {
  if (!event) return "https://www.google.com/maps/dir/";
  const lat = Number(event.latitude);
  const lng = Number(event.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
  const destination = hasCoords ? `${lat},${lng}` : (event.address || "").trim();
  if (!destination) return "https://www.google.com/maps/dir/";
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

// Opens Google Maps directions to the event. Tries a new tab first; if the
// preview iframe blocks the popup, falls back to navigating the current window
// so Google Maps still opens.
export function openDirections(event) {
  const url = eventDirectionsUrl(event);
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) window.location.href = url;
}