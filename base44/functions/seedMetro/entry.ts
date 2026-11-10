import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/*
 * Nationwide fill: spreads every seeded gathering onto its own spot in town,
 * then adds 3,000 more — each with a real photo, a post from a local profile
 * and a handful of people going. Hosted by Social Kingdom itself.
 *   { mode: "respread" }            -> fix coordinates + photos of what exists
 *   { mode: "seed", from, to }      -> add this slice of cities (index range)
 * Safe to re-run: cities that already hold their share are skipped.
 */

const LOGO = 'https://media.base44.com/images/public/6ac40db708d83e8619ab9efd/d60843e62_logo.jpg';
const TARGET = 3000;

// Real photography from Unsplash, grouped by gathering type.
const POOL = {
  barbecue: ['1523301343968-6a6ebf63c672', '1529262365544-55d1707e64e6', '1530062845289-9109b2c9c868', '1534177616072-ef7dc120449d', '1534797258760-1bd2cc95a5bd', '1579405317876-9340f1d26061', '1586058584825-c1e87ed735b4', '1621112904887-419379ce6824', '1555897209-d0bf7ab2d02f'],
  artists: ['1552996741-a99fe9fff192', '1574367157590-3454fe866961', '1575404019363-a59d384208d9', '1631614182677-caa701f3e7e2', '1631614182715-01ca784e8081', '1631614184214-cb0f8f6ed50e', '1643735942439-bec8407fd8ed', '1643735942445-0d4edac01d9c'],
  kids: ['1560421683-6856ea585c78', '1579018024219-fa9694ca5698', '1596464716127-f2a82984de30', '1605627079912-97c3810a11a4', '1607211851821-8be3cd6146f0', '1609446154807-d56805f0e007', '1613950190144-4f2a84c75e8c', '1616706161242-f1d591350d1c'],
  daycare: ['1560421683-6856ea585c78', '1596464716127-f2a82984de30', '1607211851821-8be3cd6146f0', '1613950190144-4f2a84c75e8c'],
  family: ['1474899351970-ee05f7dd1334', '1561133211-6067fc8e7348', '1578359968130-76b59bb5af13', '1585938389612-a552a28d6914', '1590166774851-bc49b23a18fe', '1592753054398-9fa298d40e85', '1618031312993-f93038f30365', '1623944889288-cd147dbb517c'],
  professional: ['1464979681340-bdd28a61699e', '1485182708500-e8f1f318ba72', '1508766917616-d22f3f1eea14', '1516197370049-569c4eaba1d6', '1542181961-9590d0c79dab', '1551529563-fce9529e67ac', '1556740767-414a9c4860c1', '1587337657836-5084db88308c'],
  drinks: ['1550064825-b68aa0370fda', '1556463208-f8c2505e8299', '1558383738-8e44bbf6b093', '1606104218720-3c8a64306844', '1621275471769-e6aa344546d5', '1634185904286-80a2ca56898c', '1670662313941-56ebffead895', '1675416864738-373085409a19'],
  sports: ['1489244094604-1758de9a6728', '1513276193780-64b881470da8', '1513593771513-7b58b6c4af38', '1540474861915-87c6b849f6d0', '1540539234-c14a20fb7c7b', '1552674605-db6ffd4facb5', '1602263515015-dd72f8e9f301', '1645238426817-8c3e7d1396cf'],
  automotive: ['1533506462431-fb52a8f5297d', '1534096331554-af5d8b510bbf', '1690244565900-56d858eb8125', '1690244565910-65718e5f851d', '1690244565975-de79249977c9', '1650039549639-de095177bf35'],
  parties: ['1526139334526-f591a54b477c', '1532079563951-0c8a7dacddb3', '1535898331935-2d274aff0fbc', '1552912470-ee2e96439539', '1552993873-0dd1110e025f', '1583889659384-64d9df2347ba', '1608479709386-98826dbb642b'],
  activities: ['1526139334526-f591a54b477c', '1556463208-f8c2505e8299', '1552993873-0dd1110e025f', '1516197370049-569c4eaba1d6'],
  religious: ['1464979681340-bdd28a61699e', '1508766917616-d22f3f1eea14', '1551529563-fce9529e67ac'],
  resource_fairs: ['1485182708500-e8f1f318ba72', '1556740767-414a9c4860c1', '1587337657836-5084db88308c'],
  local_sale: ['1552996741-a99fe9fff192', '1575404019363-a59d384208d9', '1643735942439-bec8407fd8ed'],
};

const photo = (category, index) => {
  const list = POOL[category] || POOL.parties;
  const id = list[((index % list.length) + list.length) % list.length];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
};

/* Cities the map already covers, plus the 100k+ metros it was still missing. */
const EXTRA_CITIES = [
  ['Fort Lauderdale', 'FL', 26.1224, -80.1373], ['Cape Coral', 'FL', 26.5629, -81.9495],
  ['Clearwater', 'FL', 27.9659, -82.8001], ['Lakeland', 'FL', 28.0395, -81.9498],
  ['Palm Bay', 'FL', 28.0345, -80.5887], ['Boca Raton', 'FL', 26.3683, -80.1289],
  ['Gainesville', 'FL', 29.6516, -82.3248], ['Lansing', 'MI', 42.7325, -84.5555],
  ['Flint', 'MI', 43.0125, -83.6875], ['Kalamazoo', 'MI', 42.2917, -85.5872],
  ['Peoria', 'IL', 40.6936, -89.589], ['Springfield', 'IL', 39.7817, -89.6501],
  ['Champaign', 'IL', 40.1164, -88.2434], ['Pasadena', 'CA', 34.1478, -118.1445],
  ['Torrance', 'CA', 33.8358, -118.3406], ['Fremont', 'CA', 37.5485, -121.9886],
  ['Fontana', 'CA', 34.0922, -117.435], ['Moreno Valley', 'CA', 33.9425, -117.2297],
  ['Rancho Cucamonga', 'CA', 34.1064, -117.5931], ['Santa Clarita', 'CA', 34.3917, -118.5426],
  ['Lancaster', 'CA', 34.6868, -118.1542], ['Hayward', 'CA', 37.6688, -122.0808],
  ['Salinas', 'CA', 36.6777, -121.6555], ['Visalia', 'CA', 36.3302, -119.2921],
  ['Oxnard', 'CA', 34.1975, -119.1771], ['Modesto', 'CA', 37.6391, -120.9969],
  ['Everett', 'WA', 47.979, -122.2021], ['Kent', 'WA', 47.3809, -122.2348],
  ['Renton', 'WA', 47.4829, -122.2171], ['Beaverton', 'OR', 45.4871, -122.8037],
  ['Hillsboro', 'OR', 45.5229, -122.9898], ['Gresham', 'OR', 45.5001, -122.4302],
  ['Youngstown', 'OH', 41.0998, -80.6495], ['Canton', 'OH', 40.7989, -81.3784],
  ['Brownsville', 'TX', 25.9017, -97.4975], ['McAllen', 'TX', 26.2034, -98.23],
  ['Laredo', 'TX', 27.5036, -99.5076], ['Corpus Christi', 'TX', 27.8006, -97.3964],
  ['Amarillo', 'TX', 35.222, -101.8313], ['Lubbock', 'TX', 33.5779, -101.8552],
  ['Waco', 'TX', 31.5493, -97.1467], ['Fayetteville', 'NC', 35.0527, -78.8784],
  ['Wilmington', 'NC', 34.2257, -77.9447], ['Asheville', 'NC', 35.5951, -82.5515],
  ['Athens', 'GA', 33.9519, -83.3576], ['Rock Hill', 'SC', 34.9249, -81.0251],
  ['Boulder', 'CO', 40.015, -105.2705], ['Greeley', 'CO', 40.4233, -104.7091],
  ['Ogden', 'UT', 41.223, -111.9738], ['St. George', 'UT', 37.0965, -113.5684],
  ['Flagstaff', 'AZ', 35.1983, -111.6513], ['Idaho Falls', 'ID', 43.4917, -112.0339],
  ['St. Cloud', 'MN', 45.5579, -94.1632], ['Eau Claire', 'WI', 44.8113, -91.4985],
  ['Ames', 'IA', 42.0308, -93.6319], ['Joplin', 'MO', 37.0842, -94.5133],
  ['Monroe', 'LA', 32.5093, -92.1193], ['Tuscaloosa', 'AL', 33.2098, -87.5692],
  ['Auburn', 'AL', 32.6099, -85.4808], ['Valdosta', 'GA', 30.8327, -83.2785],
  ['Scranton', 'PA', 41.409, -75.6624], ['Lancaster', 'PA', 40.0379, -76.3055],
  ['Harrisburg', 'PA', 40.2732, -76.8867], ['Bethlehem', 'PA', 40.6259, -75.3705],
  ['Trenton', 'NJ', 40.2206, -74.7597], ['Brockton', 'MA', 42.0834, -71.0184],
  ['New Bedford', 'MA', 41.6362, -70.9342], ['Utica', 'NY', 43.1009, -75.2327],
  ['Ithaca', 'NY', 42.4439, -76.5019], ['Roanoke', 'VA', 37.271, -79.9414],
  ['Charlottesville', 'VA', 38.0293, -78.4767], ['Hampton', 'VA', 37.0299, -76.3452],
];

const NEIGHBORHOODS = ['Downtown', 'Old Town', 'the East End', 'Northside', 'the Arts District', 'Midtown', 'the West Side', 'Riverside', 'the South End', 'the Warehouse District'];
const STREETS = ['Main St', 'Oak St', 'Central Ave', 'Market St', 'Union Ave', '2nd Ave', 'Mill Rd', 'Lake St', 'Park Ave', 'Cedar St'];

const TYPES = [
  { category: 'barbecue', hour: 12, age: 'all ages', tags: ['bbq', 'food'],
    titles: ['Backyard BBQ & Yard Games', 'Sunday Cookout & Cornhole', 'Smoke & Sides Block Party'],
    descs: ['Burgers, hot dogs and cornhole in a backyard off {street}. Bring a side if you can, bring a friend either way.',
      'A grill, a cooler and open seats. We are going through {hood} all afternoon — kids and dogs welcome.',
      'Pulled pork and fixings until the trays are empty. First timers get the good seat by the shade.'] },
  { category: 'drinks', hour: 19, age: '21+', tags: ['drinks', 'nightlife'],
    titles: ['Golden Hour Rooftop Mixer', 'Cocktails & Conversation', 'First Round on Us'],
    descs: ['Drinks, skyline views and a few new faces in {hood}. Come solo, leave with plans.',
      'Small tables, good pours, no pressure. Say the app sent you and we will introduce you around.',
      'A relaxed happy hour for anyone new in town. Two servers, plenty of bar seats, music low enough to talk.'] },
  { category: 'sports', hour: 7, age: 'all ages', tags: ['running', 'outdoors'],
    titles: ['Morning Run Crew', 'Easy 5K & Coffee After', 'Pickup Basketball Open Run'],
    descs: ['Easy pace, nobody gets dropped. We finish at a coffee shop on {street} and hang for a bit.',
      'Meet at the lot off {street} ten minutes early. All speeds welcome, we regroup at every corner.',
      'Bring water. Two loops available: a short one and a longer one for the people training.'] },
  { category: 'artists', hour: 18, age: 'all ages', tags: ['art', 'makers'],
    titles: ['Makers & Art Night', 'Local Artist Showcase', 'Open Studio Evening'],
    descs: ['Painters, ceramicists and printmakers showing their work in {hood}. Prints for sale, cash preferred.',
      'Six local artists, one room, good light. Come meet the people behind the pieces.',
      'Work in progress on the walls and a table for anyone who wants to sketch. Materials provided.'] },
  { category: 'kids', hour: 10, age: 'all ages', tags: ['kids', 'craft'],
    titles: ['Kids Craft Morning', 'Little Makers Workshop', 'Paint & Play Hour'],
    descs: ['Paint, glue and glitter for the little ones. Supplies included, aprons provided.',
      'Ages 3 to 10. Grown-ups stay and there is coffee for you at the back table.',
      'Simple projects kids can finish in an hour. Smocks on, sleeves up, everyone leaves with something.'] },
  { category: 'daycare', hour: 9, age: 'all ages', tags: ['kids', 'playgroup'],
    titles: ['Stay-and-Play Morning', 'Drop-In Playgroup', 'Toddler Meet-Up'],
    descs: ['Drop-in playgroup with a sitter on site and coffee for the grown-ups.',
      'Soft mats, blocks and a story at the end. No sign-up needed, come for as long as the nap allows.',
      'A calm hour for parents and little ones to get out of the house. Snacks shared, shoes off.'] },
  { category: 'family', hour: 11, age: 'all ages', tags: ['family', 'park'],
    titles: ['Park Playdate & Picnic', 'Family Field Day', 'Afternoon at the Park'],
    descs: ['Blankets, snacks and playground time. Stroller friendly and shaded benches for the grandparents.',
      'We are claiming the lawn near {street} from late morning. Bring a ball and something to share.',
      'Simple games for the kids, folding chairs for the rest of us. Free and open to every family.'] },
  { category: 'professional', hour: 8, age: '21+', tags: ['networking', 'careers'],
    titles: ['Coffee & Careers', 'Founders & Freelancers Meetup', 'Morning Networking Hour'],
    descs: ['Casual networking over coffee for anyone thinking about a change. Bring a card if you have one.',
      'Ten-minute intros, then open conversation. Recruiters and people between jobs all welcome.',
      'A table in the back is ours from eight to ten. Come for ten minutes or stay the whole time.'] },
  { category: 'religious', hour: 8, age: 'all ages', tags: ['community', 'faith'],
    titles: ['Community Prayer Breakfast', 'Sunday Fellowship Meal', 'Open House & Prayer'],
    descs: ['An open, all-welcome breakfast and a short service. No dress code, no expectation.',
      'Coffee, eggs and a few minutes of quiet together. Anyone is welcome at the table.',
      'A simple gathering for people who want to start the week grounded. Kids welcome.'] },
  { category: 'activities', hour: 19, age: 'all ages', tags: ['trivia', 'games'],
    titles: ['Trivia Tuesday', 'Board Game Night', 'Pub Quiz & Prizes'],
    descs: ['Four rounds, six to a table, bragging rights on the line. Kitchen stays open the whole time.',
      'Bring a game or play what is on the shelf. Newcomers get folded into a table, no awkward standing around.',
      'Teams of up to six. Winner takes the tab for the table, second place gets the leftovers.'] },
  { category: 'parties', hour: 20, age: '21+', tags: ['market', 'music'],
    titles: ['Night Market Social', 'Warehouse Party', 'Live Music & Late Bites'],
    descs: ['Food stalls, a DJ and open tables — the social of the month in {hood}.',
      'Two rooms, one bar, and a dance floor that fills up around ten. Come early if you want a seat.',
      'Local vendors until nine, music until close. Cover is five at the door and goes to the band.'] },
  { category: 'automotive', hour: 9, age: 'all ages', tags: ['cars', 'coffee'],
    titles: ['Cars & Coffee', 'Classic Car Meet', 'Sunday Garage Gathering'],
    descs: ['Classics and late models in the lot off {street}. Free to walk around, bring the kids.',
      'Coffee cart on site, hoods up and stories longer than the lines. All makes welcome.',
      'Park, grab a cup and talk cars. No burnouts, no drama, just a good morning.'] },
  { category: 'resource_fairs', hour: 10, age: 'all ages', tags: ['resources', 'community'],
    titles: ['Community Resource Fair', 'Job & Services Fair', 'Neighborhood Help Day'],
    descs: ['Local services, job help and free resources all under one roof. Interpreters on site.',
      'Bring questions, leave with answers. Free childcare in the side room while you talk to people.',
      'Résumé reviews, utility assistance and health screenings. No appointment, no cost.'] },
  { category: 'local_sale', hour: 8, age: 'all ages', tags: ['sale', 'deals'],
    titles: ['Neighborhood Yard Sale', 'Block Sale & Bake Table', 'Flea Market Morning'],
    descs: ['Twenty families, one street, everything priced to move. Early birds welcome.',
      'Furniture, kids clothes, tools and a few things nobody can identify. Cash and Venmo.',
      'Tables set up along {street} from eight. Bring a tote and a friend who can carry things.'] },
  { category: 'drinks', hour: 17, age: '21+', tags: ['wine', 'tasting'],
    titles: ['Wine Down Wednesday', 'Tasting Flight Night', 'Neighborhood Wine Social'],
    descs: ['Four pours, small bites and a table you can pull a chair up to.',
      'A relaxed tasting for people who want to learn without a lecture. Bottles to take home.',
      'Half-price flights until seven. Sit at the long table if you are coming alone.'] },
  { category: 'sports', hour: 18, age: 'all ages', tags: ['soccer', 'league'],
    titles: ['Pickup Soccer', 'Adult Kickball League', 'Volleyball on the Sand'],
    descs: ['Cleats optional, effort required. Two teams picked on the spot, subs rotate.',
      'Coed, casual and friendly. We play until the lights come on.',
      'Show up in something you can move in. We split into teams by ten after six.'] },
  { category: 'artists', hour: 19, age: '21+', tags: ['music', 'live'],
    titles: ['Live Music Night', 'Vinyl & Coffee Listening', 'Open Mic'],
    descs: ['Three local acts, doors at seven, first band at eight. Tips go straight to the players.',
      'Bring a record or just listen. We play the whole side, no skipping.',
      'Five minutes each, sign-up sheet on the bar. Poets and comedians get the same slot.'] },
  { category: 'kids', hour: 16, age: 'all ages', tags: ['kids', 'sports'],
    titles: ['Youth Sports Clinic', 'Kids Movie Afternoon', 'Legos & Lemonade'],
    descs: ['Coaches run drills for an hour, then a scrimmage. Cleats helpful, not required.',
      'A family film on the big screen with the lights low. Popcorn included.',
      'Building tables, a challenge board and enough bricks to go around. Ages 5 and up.'] },
  { category: 'family', hour: 18, age: 'all ages', tags: ['family', 'outdoors'],
    titles: ['Sunset Family Walk', 'Backyard Movie Night', 'Community Garden Day'],
    descs: ['An easy loop with the kids and the dog, ending at the overlook for the sunset.',
      'Projector up at dusk, blankets on the grass. Bring a chair and bug spray.',
      'Weeding, planting and a shared lunch at noon. Gloves and tools provided.'] },
  { category: 'activities', hour: 18, age: 'all ages', tags: ['fitness', 'wellness'],
    titles: ['Sunrise Yoga in the Park', 'Guided Group Hike', 'Beginner Pickleball'],
    descs: ['Mats down at ten to seven, forty-five minute flow, coffee after. Bring a towel.',
      'Four miles, moderate pace, one rest stop. Good shoes and water.',
      'Paddles provided, first hour is a lesson, second hour is open play on four courts.'] },
  { category: 'parties', hour: 19, age: 'all ages', tags: ['community', 'food'],
    titles: ['Food Truck Friday', 'Neighborhood Potluck', 'Block Party'],
    descs: ['Six trucks, picnic tables and a playlist. Bring the whole household.',
      'Bring one dish that means something to you. We will handle plates and drinks.',
      'Street closed from six, chairs in the driveway, kids chalk the sidewalk.'] },
  { category: 'professional', hour: 18, age: '21+', tags: ['creative', 'networking'],
    titles: ['Creative Coworking Evening', 'Small Business Roundtable', 'Portfolio Night'],
    descs: ['Bring a laptop or a sketchbook and work alongside other people for a couple of hours.',
      'Owners comparing notes on hiring, rent and slow seasons. No pitch, no agenda.',
      'Designers, photographers and devs sharing work in progress. Feedback if you want it.'] },
];

const POST_LINES = {
  barbecue: ['Coming from work so I will be a little late — save me a plate 🍗', 'Brought way too much potato salad again. Someone help.', 'Cornhole is set up already if anyone wants a warm-up round.'],
  drinks: ['Got a table by the window, come find us 👋', 'First time here and the view is worth the stairs.', 'Anyone else coming from the north side? I can share a ride.'],
  sports: ['Legs are already sore from thinking about it 😅 See you at the lot.', 'Bringing an extra water bottle if someone forgets theirs.', 'Weather looks perfect for it. See everyone in the morning.'],
  artists: ['Hung my pieces this morning — the light in this room is unreal.', 'Brought a few small prints that did not exist last week.', 'If anyone wants a portrait sketch, I will be at the corner table.'],
  kids: ['Already have the aprons packed. My two are counting down.', 'Bringing spare wipes for whoever needs them, we have all been there.', 'This is our first one — my daughter is very excited.'],
  daycare: ['Snacks are in the bag and the stroller is by the door. We are ready.', 'Naps might be a disaster after this but worth it.', 'Happy to hold the door for anyone juggling a car seat.'],
  family: ['Blankets in the car, snacks packed. Saving a shady spot for anyone who needs one.', 'Kids are bringing the kite, pray for wind.', 'My mom is coming too and she makes the best lemonade.'],
  professional: ['Nervous but showing up. Bringing a stack of résumés just in case.', 'Anyone hiring in ops? Happy to chat over coffee.', 'Prepared a two-minute pitch and it is still too long 😂'],
  religious: ['Saving a few seats near the back if you would rather slip in quietly.', 'Bringing a coffee cake for the table.', 'First time in a while for me. Looking forward to it.'],
  activities: ['Our team is two short if anyone is free tonight.', 'Bringing the card game nobody has heard of. Trust me on this one.', 'We are the loud table in the corner, come join.'],
  parties: ['Doors at eight, DJ starts at nine. Say hi if you see the black jacket.', 'Bringing a couple of friends from out of town.', 'Parking on the side street fills up fast — plan a few extra minutes.'],
  automotive: ['Washed the car last night just for this 😂', 'Bringing my dad and his old Camaro. It might not start and that is half the fun.', 'Coffee cart is worth the trip alone.'],
  resource_fairs: ['There is free childcare in the side room, that was not obvious last year.', 'Heads up: bring ID if you want help with the utility forms.', 'Résumé printed and ready.'],
  local_sale: ['We are at the end of the street with the tool table. Come make an offer.', 'Kids already sold half their toys to each other.', 'Baked table is next to us and it smells incredible.'],
};

const pick = (list, index) => list[((index % list.length) + list.length) % list.length];

// Place a city's gatherings around the town instead of on one shared point.
function offset(lat, lng, index) {
  const distance = 0.32 + (index % 9) * 0.14; // miles from downtown
  const angle = index * 2.399963 + (lat % 0.5) * 4;
  const dLat = (Math.cos(angle) * distance) / 69;
  const dLng = (Math.sin(angle) * distance) / (69 * Math.cos((lat * Math.PI) / 180));
  return [Number((lat + dLat).toFixed(5)), Number((lng + dLng).toFixed(5))];
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function bulkCreate(client, entity, rows) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      return await client.entities[entity].bulkCreate(rows);
    } catch (e) {
      const message = String(e.message || e);
      const retry = message.match(/Retry after (\d+)s/i);
      if (!/Rate limit/i.test(message) || !retry) throw e;
      await wait((Number(retry[1]) + 2) * 1000);
    }
  }
  throw new Error(`Rate limit retries exhausted for ${entity}`);
}

async function allPages(client, entity, query) {
  const rows = [];
  let cursor;
  for (let i = 0; i < 12; i++) {
    const page = await client.entities[entity].filter(query, { limit: 500, cursor });
    rows.push(...(page.items || []));
    if (!page.has_more || !page.next_cursor) break;
    cursor = page.next_cursor;
  }
  return rows;
}

// One entry per town: its gatherings are spread around the center, so the
// average of their spots is the center to build on.
function citiesInUse(events) {
  const seen = new Map();
  events.forEach((ev) => {
    const match = String(ev.address || '').match(/^(.*),\s*([A-Z]{2})$/);
    if (!match) return;
    const key = `${match[1]}|${match[2]}`;
    const entry = seen.get(key) || { city: match[1], state: match[2], lat: 0, lng: 0, n: 0 };
    entry.lat += ev.latitude;
    entry.lng += ev.longitude;
    entry.n += 1;
    seen.set(key, entry);
  });
  return [...seen.values()].map((c) => ({
    city: c.city,
    state: c.state,
    lat: Number((c.lat / c.n).toFixed(5)),
    lng: Number((c.lng / c.n).toFixed(5)),
  }));
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const client = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'seed';

    const seeded = await allPages(client, 'Event', { is_seeded: true });

    if (mode === 'respread') {
      const groups = new Map();
      seeded.forEach((ev) => {
        const key = `${Math.round(ev.latitude * 1000)}|${Math.round(ev.longitude * 1000)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(ev);
      });
      const updates = [];
      let n = 0;
      groups.forEach((list) => {
        list.forEach((ev, i) => {
          const [lat, lng] = offset(ev.latitude, ev.longitude, i);
          updates.push({ id: ev.id, latitude: lat, longitude: lng, image_url: photo(ev.category, n++) });
        });
      });
      for (let i = 0; i < updates.length; i += 200) {
        await client.entities.Event.bulkUpdate(updates.slice(i, i + 200));
      }
      return Response.json({ ok: true, spread: updates.length });
    }

    // The cities on the map already, plus the metros that were still empty.
    const base = citiesInUse(seeded);
    const known = new Set(base.map((c) => `${c.city}|${c.state}`));
    EXTRA_CITIES.forEach(([city, state, lat, lng], i) => {
      if (known.has(`${city}|${state}`)) return;
      base.push({ city, state, lat, lng, seed: 900 + i });
    });
    const cities = base.sort((a, b) => `${a.state}${a.city}`.localeCompare(`${b.state}${b.city}`));

    const perCity = Math.floor(TARGET / cities.length);
    const remainder = TARGET % cities.length;

    const from = Math.max(0, Number(body.from) || 0);
    const to = Math.min(cities.length, Number(body.to) || cities.length);

    const personas = await allPages(client, 'Persona', {});
    const byState = {};
    personas.forEach((p) => {
      byState[p.state] = byState[p.state] || [];
      byState[p.state].push(p);
    });

    let events = 0;
    let posts = 0;
    let attendance = 0;
    const skipped = [];

    for (let c = from; c < to; c++) {
      const city = cities[c];
      const want = perCity + (c < remainder ? 1 : 0);
      const already = seeded.filter((ev) => ev.address === `${city.city}, ${city.state}` && ev.host_name === 'Social Kingdom').length;
      const need = want - already;
      if (need <= 0) {
        skipped.push(city.city);
        continue;
      }

      const locals = byState[city.state] && byState[city.state].length ? byState[city.state] : personas;
      const eventRows = [];
      for (let k = 0; k < need; k++) {
        const template = pick(TYPES, c + k);
        const variant = Math.floor((c * 7 + k) / 3);
        const [lat, lng] = offset(city.lat, city.lng, k + (already % 6));
        const when = new Date();
        when.setDate(when.getDate() + (((c * 3 + k * 5) % 38) + 1));
        when.setHours(template.hour, (c + k) % 2 === 0 ? 0 : 30, 0, 0);
        const street = pick(STREETS, c + k * 3);
        const hood = pick(NEIGHBORHOODS, c * 2 + k);
        eventRows.push({
          title: `${city.city} ${pick(template.titles, variant)}`,
          description: pick(template.descs, c + k).replace('{street}', street).replace('{hood}', hood),
          category: template.category,
          latitude: lat,
          longitude: lng,
          address: `${city.city}, ${city.state}`,
          tags: template.tags,
          age_bracket: template.age,
          dress_code: '',
          start_time: when.toISOString(),
          image_url: photo(template.category, c * 7 + k * 3),
          visibility: 'public',
          host_name: 'Social Kingdom',
          host_avatar: LOGO,
          host_persona_id: '',
          auto_approve: true,
          is_seeded: true,
        });
      }

      const created = await bulkCreate(client, 'Event', eventRows);
      events += eventRows.length;

      const postRows = [];
      const attendRows = [];
      // Everyone going has to be a different person, so a small state roster
      // borrows from the wider set of profiles instead of repeating itself.
      const roster = [];
      const seenIds = new Set();
      [...locals.filter((p) => p.city !== city.city), ...locals, ...personas].forEach((p) => {
        if (seenIds.has(p.id)) return;
        seenIds.add(p.id);
        roster.push(p);
      });

      created.forEach((ev, idx) => {
        const authors = roster.length ? roster : personas;
        const author = pick(authors, c * 5 + idx * 3);
        const line = pick(POST_LINES[ev.category] || POST_LINES.parties, c + idx);
        postRows.push({
          content: line,
          image_url: photo(ev.category, c * 5 + idx * 2 + 1),
          author_id: author.id,
          author_name: author.name,
          author_avatar: author.avatar_url,
          event_id: ev.id,
          likes: 3 + ((c + idx * 7) % 26),
          music_url: '',
          music_title: '',
          music_artist: '',
          music_artwork: '',
        });

        const going = 3 + ((c + idx) % 4);
        const used = new Set([author.id]);
        for (let g = 0; g < going; g++) {
          const p = pick(authors, c * 11 + idx * 7 + g);
          if (used.has(p.id)) continue;
          used.add(p.id);
          attendRows.push({
            event_id: ev.id,
            user_id: p.id,
            user_name: p.name,
            user_avatar: p.avatar_url,
            user_city: p.city,
            status: 'confirmed',
          });
        }
      });

      await bulkCreate(client, 'Post', postRows);
      posts += postRows.length;
      for (let i = 0; i < attendRows.length; i += 100) {
        await bulkCreate(client, 'Attendance', attendRows.slice(i, i + 100));
        attendance += Math.min(100, attendRows.length - i);
        await wait(400);
      }
    }

    return Response.json({ ok: true, cities: cities.length, perCity, from, to, events, posts, attendance, skipped: skipped.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}