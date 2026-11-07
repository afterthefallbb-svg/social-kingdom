// What someone who isn't signed in sees on the map: five example gatherings
// around one fixed city, so the site can be looked at without an account and
// without a location permission prompt. Real people's events never appear here.
export const EXAMPLE_CITY = {
  center: [46.0646, -118.3425],
  zoom: 13,
  label: "Walla Walla, WA",
};

export const SK_LOGO =
  "https://media.base44.com/images/public/6ac40db708d83e8619ab9efd/0d13f5955_logo.png";

const photo = (id) => `https://images.unsplash.com/photo-${id}?w=900&h=600&fit=crop&q=80`;
const face = (id) => `https://images.unsplash.com/photo-${id}?w=160&h=160&fit=crop&crop=faces&q=80`;

export const EXAMPLE_PEOPLE = [
  { id: "sk_ex_1", name: "Maya R.", avatar: face("1494790108377-be9c29b29330") },
  { id: "sk_ex_2", name: "Andre T.", avatar: face("1500648767791-00dcc994a43e") },
  { id: "sk_ex_3", name: "Jessa L.", avatar: face("1534528741775-53994a69daeb") },
  { id: "sk_ex_4", name: "Marcus B.", avatar: face("1507003211169-0a1dd7228f2d") },
  { id: "sk_ex_5", name: "Priya N.", avatar: face("1517841905240-472988babdf9") },
  { id: "sk_ex_6", name: "Devon K.", avatar: face("1506794778202-cad84cf45f1d") },
  { id: "sk_ex_7", name: "Sofia M.", avatar: face("1531123897727-8f129e1688ce") },
  { id: "sk_ex_8", name: "Eli W.", avatar: face("1502685104226-ee32379fefbe") },
];

const [lat0, lng0] = EXAMPLE_CITY.center;

function distMi(lat, lng) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat - lat0);
  const dLng = toRad(lng - lng0);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat0)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* A start time a few days out, always in the evening so the cards read nicely. */
function inDays(days, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const RAW = [
  {
    id: "example-1",
    title: "Pickup Soccer at Pioneer Park",
    description:
      "Friendly pickup game on the big field. All skill levels welcome, bring water and a light and dark shirt.",
    category: "sports",
    latitude: lat0 + 0.004,
    longitude: lng0 + 0.006,
    address: "Pioneer Park · Public Park",
    start_time: inDays(2, 18, 0),
    image_url: photo("1574629810360-7efbbe195018"),
    post: { person: 0, content: "Field is dry and the goals are up — see everyone at six!" },
  },
  {
    id: "example-2",
    title: "Community BBQ at Heritage Park",
    description:
      "Bring something to grill and a side to share. A relaxed afternoon with good people and lawn games.",
    category: "barbecue",
    latitude: lat0 + 0.010,
    longitude: lng0 - 0.008,
    address: "Heritage Park · Public Park",
    start_time: inDays(3, 13, 30),
    image_url: photo("1555939594-58d7cb561ad1"),
    post: { person: 1, content: "I'm bringing the grill and a cooler of drinks. We need buns!" },
  },
  {
    id: "example-3",
    title: "Sunset Concert in the Park",
    description:
      "Local bands, lawn chairs, and good vibes as the sun goes down. Free and open to everyone.",
    category: "artists",
    latitude: lat0 - 0.012,
    longitude: lng0 + 0.014,
    address: "Sunset Valley Park · Public Park",
    start_time: inDays(4, 19, 0),
    image_url: photo("1514525253161-7a46d19cd819"),
    post: { person: 2, content: "Our set starts at 7:20 — come early for the opener, they're great." },
  },
  {
    id: "example-4",
    title: "Pop-Up Farmers Market",
    description:
      "Local produce, baked goods, and handmade crafts from people right in town. Cash and cards welcome.",
    category: "local_sale",
    latitude: lat0 + 0.020,
    longitude: lng0 + 0.020,
    address: "Green Meadow Park · Public Park",
    start_time: inDays(5, 9, 0),
    image_url: photo("1504674900247-0877df9cc836"),
    post: { person: 3, content: "Peaches are in this week. Come by the first row of tables." },
  },
  {
    id: "example-5",
    title: "Family Fun Day at Wildwood Park",
    description:
      "Games, snacks, and good company for the whole family. Kids welcome, everything is free.",
    category: "family",
    latitude: lat0 - 0.026,
    longitude: lng0 - 0.024,
    address: "Wildwood Park · Public Park",
    start_time: inDays(6, 11, 0),
    image_url: photo("1492684223066-81342ee5ff30"),
    post: { person: 4, content: "Bringing the lawn games and a jug of lemonade for the kids table." },
  },
];

/* ---------------------------------------------------------------- */
/* On-demand examples: one gathering per ~5 square miles around whoever is
   looking, so any city in the country looks lived-in the moment a visitor
   shares their location. Nothing is stored — the same point always yields the
   same gatherings, and real events always take their place. */

const CELL_MI = Math.sqrt(5); // a 2.24-mile square is about five square miles
const PARK_NAMES = [
  "Riverside Park", "Central Community Park", "Sunset Valley Park", "Heritage Park",
  "Lakeside Park", "Green Meadow Park", "Maple Grove Park", "Liberty Park",
  "Cedar Hill Park", "Willow Creek Park",
];

const CATALOG = [
  { category: "sports", label: "Pickup Soccer", photo: "1574629810360-7efbbe195018", post: "Field is dry and the goals are up. See everyone there!" },
  { category: "barbecue", label: "Community BBQ", photo: "1555939594-58d7cb561ad1", post: "I am bringing the grill and a cooler of drinks. We still need buns." },
  { category: "family", label: "Family Fun Day", photo: "1492684223066-81342ee5ff30", post: "Bringing lawn games and lemonade for the kids table." },
  { category: "parties", label: "Sunset Get-Together", photo: "1533174072545-7a4b6ad7a6c3", post: "Got a speaker and a playlist ready for sunset." },
  { category: "activities", label: "Park Meet & Greet", photo: "1551632811-561732d1e306", post: "Coming with a friend. Look for the blue blanket." },
  { category: "drinks", label: "Evening Social", photo: "1414235077428-338989a2e8c0", post: "Grabbing a table early, come find us." },
  { category: "kids", label: "Kids Playgroup", photo: "1471286174890-9c112ffca5b4", post: "My two are coming, they are excited for the playground." },
  { category: "artists", label: "Local Music Set", photo: "1514525253161-7a46d19cd819", post: "Our set starts at seven — come early for the opener." },
  { category: "local_sale", label: "Pop-Up Market", photo: "1504674900247-0877df9cc836", post: "Fresh produce and baked goods are in this week." },
];

function seedOf(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function exampleEventsAround(lat, lng) {
  const dLat = CELL_MI / 69;
  const dLng = CELL_MI / (69 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  const baseLat = Math.round(lat / dLat);
  const baseLng = Math.round(lng / dLng);
  const out = [];

  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      // Corners of the outer ring sit too far away to be worth a pin.
      if (Math.abs(i) === 2 && Math.abs(j) === 2) continue;
      const cellLat = baseLat + i;
      const cellLng = baseLng + j;
      const seed = seedOf(`${cellLat}:${cellLng}`);
      const cat = CATALOG[seed % CATALOG.length];
      const park = PARK_NAMES[(seed >>> 4) % PARK_NAMES.length];
      const spread = 0.55;
      const jLat = (((seed >>> 9) % 100) / 100 - 0.5) * spread;
      const jLng = (((seed >>> 16) % 100) / 100 - 0.5) * spread;
      const attendees = [0, 1, 2, 3, 4].map(
        (n) => EXAMPLE_PEOPLE[(seed + n * 3) % EXAMPLE_PEOPLE.length]
      );
      const author = attendees[0];

      out.push({
        id: `example-${cellLat}-${cellLng}`,
        title: `${cat.label} at ${park}`,
        description: `A ${cat.label.toLowerCase()} nearby, open to anyone in the area. Come say hello.`,
        category: cat.category,
        latitude: (cellLat + jLat) * dLat,
        longitude: (cellLng + jLng) * dLng,
        address: `${park} · Public Park`,
        start_time: inDays(1 + ((seed >>> 6) % 12), 10 + ((seed >>> 12) % 10)),
        image_url: photo(cat.photo),
        is_example: true,
        host_name: "Social Kingdom",
        host_avatar: SK_LOGO,
        attendees,
        post: { author_name: author.name, author_avatar: author.avatar, content: cat.post },
      });
    }
  }

  return out;
}

/* Five example gatherings, each hosted by Social Kingdom with five people
   attending and one post from one of them. */
export function exampleEvents() {
  return RAW.map((ev) => {
    const attendees = [0, 1, 2, 3, 4].map(
      (n) => EXAMPLE_PEOPLE[(RAW.indexOf(ev) + n) % EXAMPLE_PEOPLE.length]
    );
    const author = EXAMPLE_PEOPLE[ev.post.person];
    return {
      ...ev,
      is_example: true,
      host_name: "Social Kingdom",
      host_avatar: SK_LOGO,
      distanceMi: distMi(ev.latitude, ev.longitude),
      attendees,
      post: { author_name: author.name, author_avatar: author.avatar, content: ev.post.content },
    };
  });
}