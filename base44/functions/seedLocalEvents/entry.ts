import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Seeds five public placeholder events near a user's location when they are the
// first person in a ~5-mile radius (no public events already exist there).
// Events are ~2 weeks out, hosted at local parks by distinct fictional hosts,
// and auto-approve attendance requests.
const MI5_KM = 5 * 1.609344;
const SEED_RADIUS_KM = 4; // ~2.5 miles

const rand = (min, max) => Math.random() * (max - min) + min;

const HOST_NAMES = [
  "Jordan Rivers", "Maya Thompson", "Devon Brooks", "Aaliyah Carter",
  "Marcus Lee", "Sienna Patel", "Trevor Wallace", "Nina Robinson",
  "Elijah Cole", "Brianna Foster", "Camila Reyes", "Andre Mitchell"
];

const TEMPLATES = [
  { category: "activities", title: "Community Park Hangout", desc: "Casual afternoon meetup at the park. Bring a friend and something to share!" },
  { category: "barbecue", title: "Weekend BBQ at the Park", desc: "Bring your own meat to grill and a side to share. Everyone welcome." },
  { category: "sports", title: "Pickup Soccer at the Park", desc: "Friendly pickup game. All skill levels welcome, bring water." },
  { category: "family", title: "Family Fun Day at the Park", desc: "Games, snacks, and good company for the whole family." },
  { category: "parties", title: "Sunset Park Get-Together", desc: "Music, lawn chairs, and good vibes as the sun goes down." },
  { category: "drinks", title: "Evening Social at the Park", desc: "Relaxed evening meetup. Bring your favorite beverage." },
  { category: "activities", title: "Morning Yoga in the Park", desc: "All-levels outdoor yoga. Bring a mat or towel." },
  { category: "kids", title: "Kids Playgroup at the Park", desc: "Let the little ones run and play while parents connect." }
];

const PARKS = [
  "Riverside Park", "Central Community Park", "Sunset Valley Park",
  "Heritage Park", "Lakeside Park", "Green Meadow Park",
  "Maple Grove Park", "Liberty Park"
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const lat = Number(body.latitude);
    const lng = Number(body.longitude);
    if (!isFinite(lat) || !isFinite(lng)) {
      return Response.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const latDelta = MI5_KM / 111;
    const lngDelta = MI5_KM / (111 * Math.cos((lat * Math.PI) / 180));
    const box = {
      visibility: 'public',
      latitude: { $gte: lat - latDelta, $lte: lat + latDelta },
      longitude: { $gte: lng - lngDelta, $lte: lng + lngDelta }
    };
    const existing = await base44.asServiceRole.entities.Event.filter(box, { limit: 1 });
    if (existing.items && existing.items.length > 0) {
      return Response.json({ seeded: false, firstInArea: false });
    }

    const sLat = SEED_RADIUS_KM / 111;
    const sLng = SEED_RADIUS_KM / (111 * Math.cos((lat * Math.PI) / 180));
    const now = Date.now();
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;

    const templates = [...TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 5);
    const hosts = [...HOST_NAMES].sort(() => Math.random() - 0.5).slice(0, 5);
    const parks = [...PARKS].sort(() => Math.random() - 0.5);

    const created = [];
    for (let i = 0; i < 5; i++) {
      const t = templates[i];
      const start = new Date(now + twoWeeks + rand(-2, 2) * 24 * 60 * 60 * 1000).toISOString();
      const ev = await base44.asServiceRole.entities.Event.create({
        title: t.title,
        description: t.desc,
        category: t.category,
        latitude: lat + rand(-sLat, sLat),
        longitude: lng + rand(-sLng, sLng),
        address: parks[i] || `Community Park ${i + 1}`,
        start_time: start,
        visibility: 'public',
        auto_approve: true,
        is_seeded: true,
        host_name: hosts[i],
        host_avatar: ''
      });
      created.push(ev.id);
    }

    return Response.json({ seeded: true, firstInArea: true, count: created.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}