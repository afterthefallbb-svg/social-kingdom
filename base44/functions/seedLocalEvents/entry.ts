import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Onboarding seeder: when a brand-new user is the first person on the app within
// a 5-mile radius (and there are no public events nearby), create five real
// public gatherings hosted by "Social Kingdom" within 3 miles, auto-invite the
// user, and flag them as onboarded.
const MI5_KM = 5 * 1.609344; // 5-mile detection radius
const MAX_KM = 3 * 1.609344; // keep every seeded event within 3 miles
const LOGO = "https://media.base44.com/images/public/6ac40db708d83e8619ab9efd/0d13f5955_logo.png";

const rand = (min, max) => Math.random() * (max - min) + min;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Varied distances so a couple are walkable / bikeable without a car.
const DIST_MI = [0.4, 0.9, 1.5, 2.2, 2.8];

const TEMPLATES = [
  { category: 'sports', title: 'Pickup Soccer at the Park', desc: 'Friendly pickup game at a public park. All skill levels welcome — bring water.' },
  { category: 'barbecue', title: 'Community BBQ at the Park', desc: 'Bring something to grill and a side to share. A relaxed afternoon with good people.' },
  { category: 'family', title: 'Family Fun Day at the Park', desc: 'Games, snacks, and good company for the whole family at a public park.' },
  { category: 'parties', title: 'Sunset Park Get-Together', desc: 'Music, lawn chairs, and good vibes as the sun goes down. All are welcome.' },
  { category: 'activities', title: 'Park Meet & Greet', desc: 'A casual afternoon meetup to connect with people nearby. Bring a friend!' },
  { category: 'drinks', title: 'Evening Social at the Park', desc: 'Relaxed evening meetup at a public park. Bring your favorite beverage.' },
  { category: 'kids', title: 'Kids Playgroup at the Park', desc: 'Let the little ones run and play while parents connect at a public park.' }
];

const PARKS = [
  'Riverside Park', 'Central Community Park', 'Sunset Valley Park',
  'Heritage Park', 'Lakeside Park', 'Green Meadow Park', 'Maple Grove Park', 'Liberty Park'
];

function distKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const lat = Number(body.latitude);
    const lng = Number(body.longitude);
    if (!isFinite(lat) || !isFinite(lng)) {
      return Response.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    const full = await svc.entities.User.get(user.id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!full) return Response.json({ seeded: false, firstInArea: false });
    if (full.sk_onboarded) return Response.json({ seeded: false, firstInArea: false });

    // Remember where this user is so future users can detect someone nearby.
    if (full.latitude !== lat || full.longitude !== lng) {
      await svc.entities.User.update(user.id, { latitude: lat, longitude: lng }).catch(() => {});
    }

    // Only brand-new accounts receive the first-in-area set.
    const created = full.created_date ? new Date(full.created_date).getTime() : Date.now();
    const isNewAccount = Date.now() - created <= 24 * 60 * 60 * 1000;
    if (!isNewAccount) {
      await svc.entities.User.update(user.id, { sk_onboarded: true }).catch(() => {});
      return Response.json({ seeded: false, firstInArea: false });
    }

    // Count the public events already near this person so the map is never empty:
    // top up to five Social Kingdom hosted gatherings when fewer exist.
    let nearbyEvents = 0;
    try {
      const latDelta = MI5_KM / 111;
      const lngDelta = MI5_KM / (111 * Math.cos((lat * Math.PI) / 180));
      const existing = await svc.entities.Event.filter({
        visibility: 'public',
        latitude: { $gte: lat - latDelta, $lte: lat + latDelta },
        longitude: { $gte: lng - lngDelta, $lte: lng + lngDelta }
      }, { limit: 5 });
      nearbyEvents = (existing?.items || []).length;
    } catch {}

    const need = Math.max(0, 5 - nearbyEvents);
    if (need === 0) {
      await svc.entities.User.update(user.id, { sk_onboarded: true }).catch(() => {});
      return Response.json({ seeded: false, firstInArea: false });
    }

    // Seed the missing Social Kingdom hosted gatherings near this person.
    const templates = shuffle(TEMPLATES).slice(0, need);
    const parks = shuffle(PARKS);
    const now = Date.now();
    const eventIds = [];

    for (let i = 0; i < need; i++) {
      const t = templates[i];
      const bearing = rand(0, Math.PI * 2);
      const dKm = Math.min(DIST_MI[i] * 1.609344, MAX_KM);
      const dLat = (dKm / 111) * Math.cos(bearing);
      const dLng = (dKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(bearing);
      const start = new Date(now + (7 + i * 2) * 86400000 + rand(-2, 2) * 86400000).toISOString();

      const ev = await svc.entities.Event.create({
        title: t.title,
        description: t.desc,
        category: t.category,
        latitude: lat + dLat,
        longitude: lng + dLng,
        address: `${parks[i] || `Community Park ${i + 1}`} (Public Park)`,
        start_time: start,
        visibility: 'public',
        auto_approve: true,
        is_seeded: true,
        host_name: 'Social Kingdom',
        host_avatar: LOGO
      });
      eventIds.push(ev.id);

      // Auto-invite the new user.
      await svc.entities.Attendance.create({
        event_id: ev.id,
        user_id: user.id,
        user_name: full.full_name || user.full_name || '',
        user_avatar: full.avatar_url || '',
        user_city: full.location || '',
        status: 'confirmed'
      }).catch(() => {});
    }

    await svc.entities.User.update(user.id, { sk_onboarded: true }).catch(() => {});

    return Response.json({ seeded: true, firstInArea: true, count: eventIds.length, eventIds });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}