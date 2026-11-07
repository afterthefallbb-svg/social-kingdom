import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// One app-wide look for every visitor, signed in or not: the current kingdom
// styling, or the plain white backdrop the owner is testing for retention.
// Reading is public (a visitor has to know which look to paint); only an admin
// can change it.
const KEY = 'backdrop_mode';
const VALID = ['kingdom', 'white'];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole;

    const requested = typeof body?.mode === 'string' && VALID.includes(body.mode) ? body.mode : null;

    if (requested) {
      const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
      if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const existing = await svc.entities.AppSetting.filter({ key: KEY }, { limit: 1 });
      const row = existing?.items?.[0];
      if (row) {
        await svc.entities.AppSetting.update(row.id, { value: requested });
      } else {
        await svc.entities.AppSetting.create({ key: KEY, value: requested });
      }
      return Response.json({ mode: requested });
    }

    const found = await svc.entities.AppSetting.filter({ key: KEY }, { limit: 1 });
    const stored = found?.items?.[0]?.value;
    return Response.json({ mode: VALID.includes(stored) ? stored : 'kingdom' });
  } catch (error) {
    // Never leave a visitor without a page: fall back to the designed look.
    return Response.json({ mode: 'kingdom', error: error.message }, { status: 200 });
  }
}