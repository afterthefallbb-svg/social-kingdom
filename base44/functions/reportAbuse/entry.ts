import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The app founder/operator. Every abuse report is emailed here.
const OWNER_EMAIL = 'afterthefallbb@gmail.com';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { reportId } = await req.json().catch(() => ({}));
    if (!reportId) return Response.json({ error: 'reportId is required' }, { status: 400 });

    const report = await base44.entities.Report.get(reportId).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!report) return Response.json({ error: 'Not found' }, { status: 404 });
    if (report.created_by_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = [
      'A Social Kingdom user filed a report.',
      '',
      `Category: ${report.category}`,
      `Reported user: ${report.target_user_name || report.target_user_id}`,
      `Reported user id: ${report.target_user_id}`,
      `Reported by: ${report.reporter_name || 'unknown'}`,
      `Reporter email: ${report.reporter_email || user.email || 'unknown'}`,
      `Conversation id: ${report.conversation_id || 'n/a'}`,
      `Report id: ${report.id}`,
      '',
      'Details:',
      report.details || '(none provided)',
    ].join('\n');

    let emailed = true;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: OWNER_EMAIL,
        subject: `Social Kingdom report: ${report.category}`,
        body,
        category: 'transactional',
      });
    } catch (error) {
      emailed = false;
      console.log('report email failed:', error?.message);
    }

    return Response.json({ emailed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}