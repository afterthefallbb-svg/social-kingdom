import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/*
 * Nationwide seed: the host profiles and the gatherings they run in every
 * major city of the lower 48. Invoked by an admin (or from the dashboard).
 *   { what: "personas" }                  -> 200 host profiles
 *   { what: "events", states: ["AL",...] } -> 5 gatherings per listed city
 * Safe to re-run: cities that already hold 5 seeded gatherings are skipped.
 */

// [city, state, latitude, longitude] — the largest city of every state plus
// the metro areas of 200k+ people.
const CITIES = [
  ["Birmingham", "AL", 33.5186, -86.8104],
  ["Huntsville", "AL", 34.7304, -86.5861],
  ["Montgomery", "AL", 32.3668, -86.3],
  ["Mobile", "AL", 30.6954, -88.0399],
  ["Phoenix", "AZ", 33.4484, -112.074],
  ["Tucson", "AZ", 32.2226, -110.9747],
  ["Mesa", "AZ", 33.4152, -111.8315],
  ["Chandler", "AZ", 33.3062, -111.8413],
  ["Scottsdale", "AZ", 33.4942, -111.9261],
  ["Gilbert", "AZ", 33.3528, -111.789],
  ["Glendale", "AZ", 33.5387, -112.186],
  ["Tempe", "AZ", 33.4255, -111.94],
  ["Little Rock", "AR", 34.7465, -92.2896],
  ["Fort Smith", "AR", 35.3859, -94.3985],
  ["Los Angeles", "CA", 34.0522, -118.2437],
  ["San Diego", "CA", 32.7157, -117.1611],
  ["San Jose", "CA", 37.3382, -121.8863],
  ["San Francisco", "CA", 37.7749, -122.4194],
  ["Fresno", "CA", 36.7378, -119.7871],
  ["Sacramento", "CA", 38.5816, -121.4944],
  ["Long Beach", "CA", 33.7701, -118.1937],
  ["Oakland", "CA", 37.8044, -122.2712],
  ["Bakersfield", "CA", 35.3733, -119.0187],
  ["Anaheim", "CA", 33.8366, -117.9143],
  ["Santa Ana", "CA", 33.7455, -117.8677],
  ["Riverside", "CA", 33.9533, -117.3962],
  ["Stockton", "CA", 37.9577, -121.2908],
  ["Irvine", "CA", 33.6846, -117.8265],
  ["Chula Vista", "CA", 32.6401, -117.0842],
  ["Denver", "CO", 39.7392, -104.9903],
  ["Colorado Springs", "CO", 38.8339, -104.8214],
  ["Aurora", "CO", 39.7294, -104.8319],
  ["Fort Collins", "CO", 40.5853, -105.0844],
  ["Lakewood", "CO", 39.7047, -105.0814],
  ["Bridgeport", "CT", 41.1792, -73.1894],
  ["New Haven", "CT", 41.3083, -72.9279],
  ["Stamford", "CT", 41.0534, -73.5387],
  ["Hartford", "CT", 41.7658, -72.6734],
  ["Wilmington", "DE", 39.7391, -75.5398],
  ["Dover", "DE", 39.1582, -75.5244],
  ["Jacksonville", "FL", 30.3322, -81.6557],
  ["Miami", "FL", 25.7617, -80.1918],
  ["Tampa", "FL", 27.9506, -82.4572],
  ["Orlando", "FL", 28.5383, -81.3792],
  ["St. Petersburg", "FL", 27.7676, -82.6403],
  ["Hialeah", "FL", 25.8576, -80.2781],
  ["Tallahassee", "FL", 30.4383, -84.2807],
  ["Atlanta", "GA", 33.749, -84.388],
  ["Columbus", "GA", 32.461, -84.9877],
  ["Augusta", "GA", 33.4735, -82.0105],
  ["Savannah", "GA", 32.0809, -81.0912],
  ["Boise", "ID", 43.615, -116.2023],
  ["Meridian", "ID", 43.6121, -116.3915],
  ["Nampa", "ID", 43.5407, -116.5635],
  ["Chicago", "IL", 41.8781, -87.6298],
  ["Aurora", "IL", 41.7606, -88.3201],
  ["Rockford", "IL", 42.2711, -89.094],
  ["Joliet", "IL", 41.525, -88.0817],
  ["Naperville", "IL", 41.7508, -88.1535],
  ["Indianapolis", "IN", 39.7684, -86.1581],
  ["Fort Wayne", "IN", 41.0793, -85.1394],
  ["Evansville", "IN", 37.9716, -87.5711],
  ["South Bend", "IN", 41.6764, -86.252],
  ["Des Moines", "IA", 41.5868, -93.625],
  ["Cedar Rapids", "IA", 41.9779, -91.6656],
  ["Davenport", "IA", 41.5236, -90.5776],
  ["Wichita", "KS", 37.6872, -97.3301],
  ["Overland Park", "KS", 38.9822, -94.6708],
  ["Kansas City", "KS", 39.1142, -94.6275],
  ["Topeka", "KS", 39.0473, -95.6752],
  ["Louisville", "KY", 38.2527, -85.7585],
  ["Lexington", "KY", 38.0406, -84.5037],
  ["Bowling Green", "KY", 36.9685, -86.4808],
  ["New Orleans", "LA", 29.9511, -90.0715],
  ["Baton Rouge", "LA", 30.4515, -91.1871],
  ["Shreveport", "LA", 32.5252, -93.7502],
  ["Lafayette", "LA", 30.2241, -92.0198],
  ["Portland", "ME", 43.6591, -70.2568],
  ["Lewiston", "ME", 44.1004, -70.2148],
  ["Baltimore", "MD", 39.2904, -76.6122],
  ["Frederick", "MD", 39.4143, -77.4105],
  ["Rockville", "MD", 39.084, -77.1528],
  ["Annapolis", "MD", 38.9784, -76.4922],
  ["Boston", "MA", 42.3601, -71.0589],
  ["Worcester", "MA", 42.2626, -71.8023],
  ["Springfield", "MA", 42.1015, -72.5898],
  ["Cambridge", "MA", 42.3736, -71.1097],
  ["Lowell", "MA", 42.6334, -71.3162],
  ["Detroit", "MI", 42.3314, -83.0458],
  ["Grand Rapids", "MI", 42.9634, -85.6681],
  ["Warren", "MI", 42.5145, -83.0146],
  ["Sterling Heights", "MI", 42.5803, -83.0302],
  ["Ann Arbor", "MI", 42.2808, -83.743],
  ["Minneapolis", "MN", 44.9778, -93.265],
  ["Saint Paul", "MN", 44.9537, -93.09],
  ["Rochester", "MN", 44.0121, -92.4802],
  ["Duluth", "MN", 46.7867, -92.1005],
  ["Jackson", "MS", 32.2988, -90.1848],
  ["Gulfport", "MS", 30.3674, -89.0928],
  ["Kansas City", "MO", 39.0997, -94.5786],
  ["St. Louis", "MO", 38.627, -90.1994],
  ["Springfield", "MO", 37.209, -93.2923],
  ["Columbia", "MO", 38.9517, -92.3341],
  ["Billings", "MT", 45.7833, -108.5007],
  ["Missoula", "MT", 46.8721, -113.994],
  ["Great Falls", "MT", 47.5002, -111.3008],
  ["Omaha", "NE", 41.2565, -95.9345],
  ["Lincoln", "NE", 40.8136, -96.7026],
  ["Bellevue", "NE", 41.1367, -95.8908],
  ["Las Vegas", "NV", 36.1699, -115.1398],
  ["Henderson", "NV", 36.0395, -114.9817],
  ["Reno", "NV", 39.5296, -119.8138],
  ["North Las Vegas", "NV", 36.1989, -115.1175],
  ["Manchester", "NH", 42.9956, -71.4548],
  ["Nashua", "NH", 42.7654, -71.4676],
  ["Concord", "NH", 43.2081, -71.5376],
  ["Newark", "NJ", 40.7357, -74.1724],
  ["Jersey City", "NJ", 40.7178, -74.0431],
  ["Paterson", "NJ", 40.9168, -74.1718],
  ["Elizabeth", "NJ", 40.664, -74.2107],
  ["Edison", "NJ", 40.5187, -74.4121],
  ["Albuquerque", "NM", 35.0844, -106.6504],
  ["Las Cruces", "NM", 32.3199, -106.7637],
  ["Santa Fe", "NM", 35.687, -105.9378],
  ["New York", "NY", 40.7128, -74.006],
  ["Buffalo", "NY", 42.8864, -78.8784],
  ["Rochester", "NY", 43.1566, -77.6088],
  ["Yonkers", "NY", 40.9312, -73.8988],
  ["Syracuse", "NY", 43.0481, -76.1474],
  ["Albany", "NY", 42.6526, -73.7562],
  ["Charlotte", "NC", 35.2271, -80.8431],
  ["Raleigh", "NC", 35.7796, -78.6382],
  ["Greensboro", "NC", 36.0726, -79.792],
  ["Durham", "NC", 35.994, -78.8986],
  ["Winston-Salem", "NC", 36.0999, -80.2442],
  ["Fargo", "ND", 46.8772, -96.7898],
  ["Bismarck", "ND", 46.8083, -100.7837],
  ["Columbus", "OH", 39.9612, -82.9988],
  ["Cleveland", "OH", 41.4993, -81.6944],
  ["Cincinnati", "OH", 39.1031, -84.512],
  ["Toledo", "OH", 41.6528, -83.5379],
  ["Akron", "OH", 41.0814, -81.519],
  ["Dayton", "OH", 39.7589, -84.1916],
  ["Oklahoma City", "OK", 35.4676, -97.5164],
  ["Tulsa", "OK", 36.154, -95.9928],
  ["Norman", "OK", 35.2226, -97.4395],
  ["Portland", "OR", 45.5152, -122.6784],
  ["Salem", "OR", 44.9429, -123.0351],
  ["Eugene", "OR", 44.0521, -123.0868],
  ["Bend", "OR", 44.0582, -121.3153],
  ["Philadelphia", "PA", 39.9526, -75.1652],
  ["Pittsburgh", "PA", 40.4406, -79.9959],
  ["Allentown", "PA", 40.6023, -75.4714],
  ["Erie", "PA", 42.1292, -80.0851],
  ["Reading", "PA", 40.3356, -75.9269],
  ["Providence", "RI", 41.824, -71.4128],
  ["Warwick", "RI", 41.7001, -71.4162],
  ["Cranston", "RI", 41.7798, -71.4373],
  ["Charleston", "SC", 32.7765, -79.9311],
  ["Columbia", "SC", 34.0007, -81.0348],
  ["Greenville", "SC", 34.8526, -82.394],
  ["Sioux Falls", "SD", 43.546, -96.7311],
  ["Rapid City", "SD", 44.0805, -103.231],
  ["Nashville", "TN", 36.1627, -86.7816],
  ["Memphis", "TN", 35.1495, -90.049],
  ["Knoxville", "TN", 35.9606, -83.9207],
  ["Chattanooga", "TN", 35.0456, -85.3097],
  ["Houston", "TX", 29.7604, -95.3698],
  ["San Antonio", "TX", 29.4241, -98.4936],
  ["Dallas", "TX", 32.7767, -96.797],
  ["Austin", "TX", 30.2672, -97.7431],
  ["Fort Worth", "TX", 32.7555, -97.3308],
  ["El Paso", "TX", 31.7619, -106.485],
  ["Arlington", "TX", 32.7357, -97.1081],
  ["Salt Lake City", "UT", 40.7608, -111.891],
  ["West Valley City", "UT", 40.6916, -112.0011],
  ["Provo", "UT", 40.2338, -111.6585],
  ["Burlington", "VT", 44.4759, -73.2121],
  ["Montpelier", "VT", 44.2601, -72.5754],
  ["Virginia Beach", "VA", 36.8529, -75.978],
  ["Norfolk", "VA", 36.8508, -76.2859],
  ["Chesapeake", "VA", 36.7682, -76.2875],
  ["Richmond", "VA", 37.5407, -77.436],
  ["Seattle", "WA", 47.6062, -122.3321],
  ["Spokane", "WA", 47.6588, -117.426],
  ["Tacoma", "WA", 47.2529, -122.4443],
  ["Vancouver", "WA", 45.6387, -122.6615],
  ["Charleston", "WV", 38.3498, -81.6326],
  ["Huntington", "WV", 38.4192, -82.4452],
  ["Milwaukee", "WI", 43.0389, -87.9065],
  ["Madison", "WI", 43.0731, -89.4012],
  ["Green Bay", "WI", 44.5133, -88.0132],
  ["Cheyenne", "WY", 41.14, -104.8202],
  ["Casper", "WY", 42.8666, -106.3131],
];

const MALE_FIRST = ["James", "Marcus", "Diego", "Ethan", "Andre", "Caleb", "Noah", "Luis", "Tyler", "Omar", "Nathan", "Julian", "Ryan", "Malik", "Xavier", "Cole", "Elias", "Mateo", "Aaron", "Trevon", "Wes", "Curtis", "Devon", "Grant", "Isaiah", "Jonah", "Kendrick", "Logan", "Micah", "Nico", "Owen", "Preston", "Quentin", "Rafael", "Silas", "Terrence", "Victor", "Wyatt", "Zane", "Brody"];
const FEMALE_FIRST = ["Ava", "Bianca", "Camila", "Danielle", "Elena", "Faith", "Gabriela", "Hannah", "Isabel", "Jasmine", "Kayla", "Layla", "Maya", "Nadia", "Olivia", "Priya", "Quinn", "Rosa", "Sofia", "Tessa", "Uma", "Valeria", "Whitney", "Ximena", "Yara", "Zoe", "Adriana", "Brianna", "Chloe", "Delia", "Erica", "Felicity", "Gina", "Hollis", "Imani", "Jade", "Keisha", "Leah", "Monica", "Naomi"];
const LAST = ["Alvarez", "Bennett", "Carter", "Diaz", "Ellis", "Foster", "Garcia", "Hayes", "Iverson", "Jenkins", "Kim", "Lopez", "Mitchell", "Nguyen", "Ortega", "Patel", "Quintero", "Reyes", "Sullivan", "Turner", "Underwood", "Vasquez", "Walker", "Xu", "Young", "Zamora", "Brooks", "Coleman", "Delgado", "Fisher"];

const JOBS = ["nurse", "line cook", "graphic designer", "warehouse lead", "teacher", "electrician", "barista", "physical therapist", "sales rep", "software tester", "hairdresser", "paramedic", "property manager", "truck driver", "social worker", "personal trainer", "accountant", "florist", "mechanic", "marketing coordinator"];

const INTERESTS = ["live music", "hiking", "pickup basketball", "thrifting", "cooking", "photography", "college football", "fishing", "yoga", "skateboarding", "board games", "gardening", "running", "road trips", "coffee shops", "karaoke", "volunteering", "cycling", "art shows", "dancing"];

const OPENERS = [
  "What are you up to tonight?",
  "Where are you from?",
  "How's your week going?",
  "Got any good plans this weekend?",
  "What do you do for fun around here?",
];

const bios = (city, state, job, a, b) => [
  `${job.charAt(0).toUpperCase() + job.slice(1)} in ${city}. Usually out chasing ${a} — say hi if you're nearby 👋`,
  `${city} born and raised. Big on ${a} and ${b}. Always up for meeting new people.`,
  `New-ish to ${city} and still finding my spots. Love ${a}. Got a recommendation for me?`,
  `${job.charAt(0).toUpperCase() + job.slice(1)} Monday to Friday, ${a} the rest of the time. ${city}, ${state} 📍`,
  `Here for good food, live music, and the people. ${a} when the weather plays along.`,
  `${job.charAt(0).toUpperCase() + job.slice(1)} over here. I host a few gatherings around ${city} — come through sometime.`,
  `Weekends are for ${a} and ${b}. Weekdays are for coffee. ☕`,
  `${state} living, ${city} based. ${a} keeps me sane. Ask me about ${b} and I won't stop talking.`,
];

const slugify = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The app allows 75 bulk creates a minute, so a nationwide run waits its turn
// instead of failing halfway through a state.
async function bulkCreate(base44, entity, rows) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      return await base44.asServiceRole.entities[entity].bulkCreate(rows);
    } catch (e) {
      const message = String(e.message || e);
      const retry = message.match(/Retry after (\d+)s/i);
      if (!/Rate limit/i.test(message) || !retry) throw e;
      await wait((Number(retry[1]) + 2) * 1000);
    }
  }
  throw new Error(`Rate limit retries exhausted for ${entity}`);
}

const EVENT_TYPES = [
  { category: "sports", title: (c) => `${c} Morning Run Crew`, desc: (c) => `Easy 5K through ${c} with a coffee stop at the end. All paces welcome, nobody gets dropped.`, tags: ["running", "outdoors"] },
  { category: "drinks", title: (c) => `${c} Golden Hour Rooftop Mixer`, desc: (c) => `Drinks, skyline views and a few new faces in downtown ${c}. Come solo, leave with plans.`, tags: ["drinks", "nightlife"], age: "21+" },
  { category: "barbecue", title: (c) => `${c} Backyard BBQ & Yard Games`, desc: (c) => `Burgers, hot dogs and cornhole in a ${c} backyard. Bring a side if you can, bring a friend either way.`, tags: ["bbq", "food"] },
  { category: "artists", title: (c) => `${c} Makers & Art Night`, desc: (c) => `Local painters, ceramicists and printmakers showing their work in ${c}. Prints for sale, cash preferred.`, tags: ["art", "makers"] },
  { category: "parties", title: (c) => `${c} Night Market Social`, desc: (c) => `Food stalls, a DJ and open tables — the ${c} social of the month.`, tags: ["market", "music"], age: "21+" },
  { category: "family", title: (c) => `${c} Park Playdate & Picnic`, desc: (c) => `Blankets, snacks and playground time for ${c} families. Stroller friendly.`, tags: ["family", "park"] },
  { category: "kids", title: (c) => `${c} Kids Craft Morning`, desc: (c) => `Paint, glue and glitter for the little ones in ${c}. Supplies included, aprons provided.`, tags: ["kids", "craft"] },
  { category: "professional", title: (c) => `${c} Coffee & Careers`, desc: (c) => `Casual networking over coffee for anyone in ${c} thinking about a change.`, tags: ["networking", "careers"] },
  { category: "religious", title: (c) => `${c} Community Prayer Breakfast`, desc: (c) => `An open, all-welcome breakfast and short service in ${c}.`, tags: ["community", "faith"] },
  { category: "activities", title: (c) => `${c} Trivia Tuesday`, desc: (c) => `Four rounds, six to a table, ${c} bragging rights on the line.`, tags: ["trivia", "games"] },
  { category: "automotive", title: (c) => `${c} Cars & Coffee`, desc: (c) => `Classics and late models in the ${c} lot. Free to walk around, bring the kids.`, tags: ["cars", "coffee"] },
  { category: "resource_fairs", title: (c) => `${c} Community Resource Fair`, desc: (c) => `Local services, job help and free resources all under one roof in ${c}.`, tags: ["resources", "community"] },
  { category: "local_sale", title: (c) => `${c} Neighborhood Sale`, desc: (c) => `Twenty families, one ${c} street, everything priced to move. Early birds welcome.`, tags: ["sale", "deals"] },
  { category: "daycare", title: (c) => `${c} Stay-and-Play Morning`, desc: (c) => `Drop-in playgroup in ${c} with a sitter on site and coffee for the grown-ups.`, tags: ["kids", "playgroup"] },
];

function buildPersonas() {
  const rows = [];
  for (let i = 0; i < 200; i++) {
    const female = i % 2 === 1;
    const n = Math.floor(i / 2);
    const [city, state] = CITIES[i % CITIES.length];
    const first = female ? FEMALE_FIRST[n % FEMALE_FIRST.length] : MALE_FIRST[n % MALE_FIRST.length];
    const last = LAST[(n * 7 + (female ? 3 : 0)) % LAST.length];
    const job = JOBS[i % JOBS.length];
    const a = INTERESTS[i % INTERESTS.length];
    const b = INTERESTS[(i * 3 + 5) % INTERESTS.length];
    const key = `p${i + 1}`;
    const avatar = `https://randomuser.me/api/portraits/${female ? "women" : "men"}/${n % 100}.jpg`;
    rows.push({
      name: `${first} ${last}`,
      persona_key: key,
      avatar_url: avatar,
      photos: [
        avatar,
        `https://picsum.photos/seed/${slugify(city)}-${key}-1/900/900`,
        `https://picsum.photos/seed/${slugify(city)}-${key}-2/900/900`,
        `https://picsum.photos/seed/${slugify(city)}-${key}-3/900/900`,
      ],
      bio: bios(city, state, job, a, b)[i % 8],
      job,
      city,
      state,
      age: 22 + (i % 20),
      interests: [a, b],
      greeting: OPENERS[i % OPENERS.length],
    });
  }
  return rows;
}

function eventsForCity(city, state, lat, lng, cityIndex, hosts) {
  const rows = [];
  for (let k = 0; k < 5; k++) {
    const type = EVENT_TYPES[(cityIndex * 3 + k) % EVENT_TYPES.length];
    const host = hosts.length ? hosts[(cityIndex + k) % hosts.length] : null;
    const when = new Date();
    when.setDate(when.getDate() + ((cityIndex * 7 + k * 3) % 40) + 2);
    when.setHours(18, 30, 0, 0);
    rows.push({
      title: type.title(city),
      description: type.desc(city),
      category: type.category,
      latitude: lat,
      longitude: lng,
      address: `${city}, ${state}`,
      tags: type.tags,
      age_bracket: type.age || "all ages",
      start_time: when.toISOString(),
      image_url: `https://picsum.photos/seed/${slugify(city)}-${slugify(type.category)}-${k}/1000/700`,
      visibility: "public",
      host_name: host ? host.name : "Social Kingdom Host",
      host_avatar: host ? host.avatar_url : "",
      host_persona_id: host ? host.id : "",
      auto_approve: true,
      is_seeded: true,
    });
  }
  return rows;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const what = body.what || "events";
    const states = Array.isArray(body.states) && body.states.length ? body.states : null;

    if (what === "personas") {
      const existing = await base44.asServiceRole.entities.Persona.count({});
      if (existing > 0 && !body.force) {
        return Response.json({ ok: true, skipped: true, personas: existing });
      }
      const rows = buildPersonas();
      for (let i = 0; i < rows.length; i += 50) {
        await bulkCreate(base44, "Persona", rows.slice(i, i + 50));
      }
      return Response.json({ ok: true, created: rows.length });
    }

    // Events: every listed city gets five gatherings, hosted by a local profile.
    const personas = (await base44.asServiceRole.entities.Persona.filter({}, { limit: 500 })).items || [];
    const byState = {};
    personas.forEach((p) => {
      byState[p.state] = byState[p.state] || [];
      byState[p.state].push(p);
    });

    const targets = CITIES.map((c, index) => ({ city: c[0], state: c[1], lat: c[2], lng: c[3], index }))
      .filter((c) => !states || states.includes(c.state));

    let created = 0;
    let skipped = 0;
    for (const target of targets) {
      const already = await base44.asServiceRole.entities.Event.count({
        is_seeded: true,
        latitude: target.lat,
        longitude: target.lng,
      });
      if (already >= 5) {
        skipped += 1;
        continue;
      }
      const hosts = byState[target.state] || personas;
      const rows = eventsForCity(target.city, target.state, target.lat, target.lng, target.index, hosts);
      await bulkCreate(base44, "Event", rows);
      created += rows.length;
    }

    return Response.json({ ok: true, cities: targets.length, skipped, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}