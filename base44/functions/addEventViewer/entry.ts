import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Adds viewer user IDs to a personal event's `visible_to` allowlist.
// The caller must be the event host OR already allowed to see the event
// (i.e. a friend/invitee/attendee who can themselves invite others).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const eventId = body.event_id;
    const userIds = Array.isArray(body.user_ids)
      ? body.user_ids.map((id) => String(id).trim()).filter(Boolean)
      : [];
    if (!eventId || !userIds.length) {
      return Response.json({ error: 'Missing event_id or user_ids' }, { status: 400 });
    }

    const event = await base44.asServiceRole.entities.Event.get(eventId);
    if (!event) return Response.json({ error: 'Event not found' }, { status: 404 });
    if (event.visibility !== 'personal') {
      return Response.json({ ok: true, skipped: 'not personal' });
    }

    const existing = Array.isArray(event.visible_to) ? event.visible_to : [];
    const canAdd =
      event.created_by_id === user.id ||
      existing.includes(user.id) ||
      user.role === 'admin';
    if (!canAdd) {
      return Response.json({ error: 'Not allowed to add viewers' }, { status: 403 });
    }

    const merged = new Set(existing);
    userIds.forEach((id) => merged.add(id));
    merged.delete(event.created_by_id); // host always has access via created_by_id
    const next = [...merged];
    await base44.asServiceRole.entities.Event.update(eventId, { visible_to: next });
    return Response.json({ ok: true, visible_to: next });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}