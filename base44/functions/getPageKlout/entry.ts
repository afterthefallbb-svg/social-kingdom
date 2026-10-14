import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Computes a page's total clout: direct likes on the page itself PLUS likes on
// the posts, comments and photos that belong to that page. Returns { total, counts }.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const page_type = body.page_type;
    const page_id = body.page_id;
    if (!page_type || !page_id) {
      return Response.json({ error: 'page_type and page_id required' }, { status: 400 });
    }

    // Targets whose likes roll up into this page's clout.
    const targets = [{ target_type: page_type, target_id: page_id }];

    if (page_type === 'event') {
      const [posts, photos] = await Promise.all([
        base44.entities.Post.filter({ event_id: page_id }, { limit: 500, fields: ['id'] }).catch(() => ({ items: [] })),
        base44.entities.EventPhoto.filter({ event_id: page_id }, { limit: 500, fields: ['id'] }).catch(() => ({ items: [] }))
      ]);
      const postIds = (posts.items || []).map((p) => p.id);
      postIds.forEach((id) => targets.push({ target_type: 'post', target_id: id }));
      (photos.items || []).map((p) => p.id).forEach((id) => targets.push({ target_type: 'photo', target_id: id }));
      if (postIds.length) {
        const comments = await base44.entities.Comment.filter({ post_id: { $in: postIds } }, { limit: 1000, fields: ['id'] }).catch(() => ({ items: [] }));
        (comments.items || []).map((c) => c.id).forEach((id) => targets.push({ target_type: 'comment', target_id: id }));
      }
    } else if (page_type === 'profile') {
      // Only the user's own profile-page posts (not their posts on other events).
      const posts = await base44.entities.Post.filter({ author_id: page_id }, { limit: 500, fields: ['id', 'event_id'] }).catch(() => ({ items: [] }));
      const postIds = (posts.items || []).filter((p) => !p.event_id).map((p) => p.id);
      postIds.forEach((id) => targets.push({ target_type: 'post', target_id: id }));
      if (postIds.length) {
        const comments = await base44.entities.Comment.filter({ post_id: { $in: postIds } }, { limit: 1000, fields: ['id'] }).catch(() => ({ items: [] }));
        (comments.items || []).map((c) => c.id).forEach((id) => targets.push({ target_type: 'comment', target_id: id }));
      }
    }
    // "click" pages have no posts/photos — clout is direct likes only.

    const counts = { thumbs: 0, horns: 0, crown: 0 };
    let total = 0;

    if (targets.length) {
      const orQuery = targets.map((t) => ({ target_id: t.target_id, target_type: t.target_type }));
      const res = await base44.entities.Klout.filter({ $or: orQuery }, { limit: 1000 }).catch(() => ({ items: [] }));
      (res.items || []).forEach((k) => {
        if (counts[k.reaction] !== undefined) counts[k.reaction] += 1;
        total += k.value || 0;
      });
    }

    return Response.json({ total, counts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}