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