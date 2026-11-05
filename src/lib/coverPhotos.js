// Real cover photos used whenever a record has no picture of its own, so the
// app shows a photo instead of a placeholder mark. Every id here is a live
// Unsplash photo.
const photo = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const POOLS = {
  // event categories
  sports: ["1574629810360-7efbbe195018", "1517649763962-0c623066013b", "1461896836934-ffe607ba8211"],
  automotive: ["1494976388531-d1058494cdd8", "1492144534655-ae79c964c9d7", "1503376780353-7e6692767b70"],
  barbecue: ["1555939594-58d7cb561ad1", "1414235077428-338989a2e8c0", "1504674900247-0877df9cc836"],
  drinks: ["1514933651103-005eec06c04b", "1533174072545-7a4b6ad7a6c3", "1414235077428-338989a2e8c0"],
  parties: ["1533174072545-7a4b6ad7a6c3", "1517457373958-b7bdd4587205", "1492684223066-81342ee5ff30"],
  professional: ["1540575467063-178a50c2df87", "1515187029135-18ee286d815b", "1556761175-b413da4baf72"],
  resource_fairs: ["1540575467063-178a50c2df87", "1522202176988-66273c2fd55f", "1529156069898-49953e39b3ac"],
  daycare: ["1503454537195-1dcabb73ffb9", "1478131143081-80f7f84ca84d", "1506905925346-21bda4d32df4"],
  kids: ["1503454537195-1dcabb73ffb9", "1478131143081-80f7f84ca84d", "1551632811-561732d1e306"],
  family: ["1506905925346-21bda4d32df4", "1503454537195-1dcabb73ffb9", "1478131143081-80f7f84ca84d"],
  religious: ["1438032005730-c779502df39b", "1506905925346-21bda4d32df4", "1555939594-58d7cb561ad1"],
  activities: ["1551632811-561732d1e306", "1542038784456-1ea8e935640e", "1461896836934-ffe607ba8211"],
  artists: ["1516450360452-9312f5e86fc7", "1510915361894-db8b60106cb1", "1511671782779-c97d3d27a1d4", "1501386761578-eac5c94b800a"],
  local_sale: ["1472851294608-062f824d29cc", "1504674900247-0877df9cc836", "1414235077428-338989a2e8c0"],
  // non-event kinds
  stream: ["1470229722913-7c0e2dbbafd3", "1551632811-561732d1e306", "1542038784456-1ea8e935640e", "1517649763962-0c623066013b"],
  cliqs: ["1529156069898-49953e39b3ac", "1511632765486-a01980e01a18", "1522202176988-66273c2fd55f", "1517457373958-b7bdd4587205", "1478131143081-80f7f84ca84d", "1494976388531-d1058494cdd8"],
  generic: ["1533174072545-7a4b6ad7a6c3", "1514525253161-7a46d19cd819", "1540575467063-178a50c2df87", "1551632811-561732d1e306"],
};

const hash = (value) => [...String(value || "")].reduce((a, c) => a + c.charCodeAt(0), 0);

/** A stable photo for a record that has none: by kind, else by category, else generic. */
export function coverPhoto(seed = "", category = "", kind = "") {
  const pool = POOLS[kind] || POOLS[category] || POOLS.generic;
  return photo(pool[hash(seed || category || kind) % pool.length]);
}

/** Cover for an event-ish record: its own photo, or a topical stand-in. */
export function eventCover(event, kind = "events") {
  return event?.image_url || coverPhoto(event?.id || event?.title, event?.category, kind);
}