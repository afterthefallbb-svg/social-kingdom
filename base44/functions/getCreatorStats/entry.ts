import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Creator-only dashboard numbers: how many people joined and how many visited.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const [users, visitors, viewAgg] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.AppView.count(),
      base44.asServiceRole.entities.AppView.aggregate({ query: {}, sum: ['views'] }).catch(() => ({ rows: [] })),
    ]);

    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const month = 30 * 24 * 60 * 60 * 1000;
    let newUsersWeek = 0;
    let newUsersMonth = 0;
    for (const u of users) {
      const created = new Date(u.created_date).getTime();
      if (created >= now - week) newUsersWeek += 1;
      if (created >= now - month) newUsersMonth += 1;
    }

    const totalViews = (viewAgg.rows || []).reduce((sum, row) => sum + (row.sum_views || 0), 0);

    return Response.json({
      total_users: users.length,
      new_users_week: newUsersWeek,
      new_users_month: newUsersMonth,
      visitors,
      total_views: totalViews,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}