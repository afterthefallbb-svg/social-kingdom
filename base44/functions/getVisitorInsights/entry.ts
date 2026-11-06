import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const cleanPath = (value) => (typeof value === 'string' && value.trim() ? value.trim() : '');

const tally = (rows, key, fallbackLabel) => {
  const counts = {};
  for (const row of rows || []) {
    const label = cleanPath(row[key]) || fallbackLabel;
    // Older visits predate these fields; skip them rather than inventing a page.
    if (!label) continue;
    counts[label] = (counts[label] || 0) + (row.count || 0);
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
};

// Creator-only: where visitors land, where they come from and where they leave.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const base = base44.asServiceRole;
    const views = base.entities.AppView;

    const [exitAgg, entryAgg, sourceAgg, visitors, signedIn, recentPage, accounts] = await Promise.all([
      views.aggregate({ query: {}, groupBy: 'exit_path' }).catch(() => ({ rows: [] })),
      views.aggregate({ query: {}, groupBy: 'entry_path' }).catch(() => ({ rows: [] })),
      views.aggregate({ query: {}, groupBy: 'referrer' }).catch(() => ({ rows: [] })),
      views.count().catch(() => 0),
      views.count({ user_id: { $ne: '' } }).catch(() => 0),
      views.list({ sort: '-last_seen', limit: 12 }).catch(() => ({ items: [] })),
      base.entities.User.list().catch(() => []),
    ]);

    const recent = (recentPage.items || []).map((row) => ({
      path: cleanPath(row.exit_path) || cleanPath(row.last_path) || '/',
      source: cleanPath(row.referrer) || 'direct',
      signed_in: Boolean(row.user_id),
      at: row.last_seen || row.created_date || null,
    }));

    return Response.json({
      visitors,
      guests: Math.max(0, visitors - signedIn),
      signed_in_visitors: signedIn,
      total_accounts: accounts.length,
      exits: tally(exitAgg.rows, 'exit_path', ''),
      entries: tally(entryAgg.rows, 'entry_path', ''),
      sources: tally(sourceAgg.rows, 'referrer', 'direct'),
      recent,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}