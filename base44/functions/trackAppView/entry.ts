import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Records one visit per browser. Public pages can be viewed without signing in,
// so a missing user is expected; the visitor key is the only identifier kept.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { visitor_key, path } = await req.json().catch(() => ({}));

    if (typeof visitor_key !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(visitor_key)) {
      return Response.json({ error: 'visitor_key is required' }, { status: 400 });
    }

    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    const safePath = typeof path === 'string' ? path.slice(0, 120) : '';
    const views = base44.asServiceRole.entities.AppView;
    const { items } = await views.filter({ visitor_key }, { limit: 1 });
    const existing = items[0];
    const now = new Date();

    if (!existing) {
      await views.create({
        visitor_key,
        views: 1,
        user_id: user?.id || '',
        last_path: safePath,
        last_seen: now.toISOString(),
      });
      return Response.json({ ok: true, counted: true });
    }

    const last = existing.last_seen ? new Date(existing.last_seen).getTime() : 0;
    const counted = now.getTime() - last > 30 * 60 * 1000;
    await views.update(existing.id, {
      views: counted ? (existing.views || 1) + 1 : existing.views || 1,
      user_id: user?.id || existing.user_id || '',
      last_path: safePath,
      last_seen: now.toISOString(),
    });
    return Response.json({ ok: true, counted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}