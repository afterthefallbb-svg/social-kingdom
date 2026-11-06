import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Records one visit per browser, and where that visit ends.
// Public pages can be viewed without signing in, so a missing user is expected;
// the visitor key is the only identifier kept.
const cleanPath = (value) => (typeof value === 'string' ? value.slice(0, 120) : '');
const cleanSource = (value) => (typeof value === 'string' ? value.slice(0, 80) : '');

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { visitor_key } = body;

    if (typeof visitor_key !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(visitor_key)) {
      return Response.json({ error: 'visitor_key is required' }, { status: 400 });
    }

    const views = base44.asServiceRole.entities.AppView;
    const now = new Date();

    // Leaving the app: remember the last page they were on. Never a new view.
    if (body.exit) {
      const { items } = await views.filter({ visitor_key }, { limit: 1 });
      const existing = items[0];
      if (!existing) return Response.json({ ok: true });
      await views.update(existing.id, {
        exit_path: cleanPath(body.exit),
        last_seen: now.toISOString(),
      });
      return Response.json({ ok: true });
    }

    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    const path = cleanPath(body.path);
    const source = cleanSource(body.referrer) || 'direct';
    const { items } = await views.filter({ visitor_key }, { limit: 1 });
    const existing = items[0];

    if (!existing) {
      await views.create({
        visitor_key,
        views: 1,
        user_id: user?.id || '',
        entry_path: path,
        last_path: path,
        exit_path: path,
        referrer: source,
        last_seen: now.toISOString(),
      });
      return Response.json({ ok: true, counted: true });
    }

    const last = existing.last_seen ? new Date(existing.last_seen).getTime() : 0;
    const counted = now.getTime() - last > 30 * 60 * 1000;
    await views.update(existing.id, {
      views: counted ? (existing.views || 1) + 1 : existing.views || 1,
      user_id: user?.id || existing.user_id || '',
      entry_path: existing.entry_path || path,
      referrer: existing.referrer || source,
      last_path: path,
      exit_path: path,
      last_seen: now.toISOString(),
    });
    return Response.json({ ok: true, counted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}