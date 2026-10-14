// Google Maps' universal URL uses the device location as the route's origin.
// Mobile devices can hand it to Maps; other devices show the route in a browser.
export function eventDirectionsUrl(event) {
  const coordinate = (value) => value == null || String(value).trim() === "" ? NaN : Number(value);
  const lat = coordinate(event?.latitude);
  const lng = coordinate(event?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
    && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
  const destination = hasCoords ? `${lat},${lng}` : String(event?.address || "").trim();
  if (!destination) return null;
  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
    dir_action: "navigate",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}