import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Two cheap identity checks that make selfie verification actually mean something:
//  "duplicate" — is this verified face already used by another account?
//  "profile"   — does a photo the user wants as their profile photo show the same
//                person as their verified selfie?
// Cost is bounded: at most MAX_EXISTING existing selfies are compared, in small
// batches, and only one call is made for a profile photo.
const MAX_EXISTING = 20;
const COMPARE_BATCH = 10;
const SIGN_BATCH = 6;

async function signSelfie(base44, fileUri) {
  const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
    file_uri: fileUri,
    expires_in: 600,
  });
  return signed_url;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mode = body.mode;

    if (mode !== 'profile' && mode !== 'duplicate') {
      return Response.json({ error: 'mode must be "profile" or "duplicate"' }, { status: 400 });
    }

    // No verified selfie on file: nothing to compare against.
    if (!user.selfie_uri) {
      return mode === 'profile'
        ? Response.json({ match: true, reason: 'No verified selfie on file' })
        : Response.json({ duplicate: false, reason: 'No verified selfie on file' });
    }

    const selfieUrl = await signSelfie(base44, user.selfie_uri);

    if (mode === 'profile') {
      const url = typeof body.url === 'string' ? body.url.trim() : '';
      if (!/^https:\/\//i.test(url)) {
        return Response.json({ error: 'url is required' }, { status: 400 });
      }
      if (url === user.selfie_uri) return Response.json({ match: true, reason: 'Same photo' });

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a strict profile-photo reviewer for a social app.

Image 1 is the account owner's verified selfie (the real person who owns this account).
Image 2 is the photo they want to use as their profile photo.

Decide whether image 2 shows the SAME PERSON as image 1.

Accept only when you are confident it is the same human face. Ignore lighting, camera angle, expression, hairstyle, hair length, glasses, makeup, filters, background, and image quality.
Reject when image 2 shows a different person, no face, more than one face, a logo, an animal, a cartoon or illustration, scenery, or a body part that is not a face.

Give a short, plain reason (max 12 words) a normal person would understand.`,
        file_urls: [selfieUrl, url],
        response_json_schema: {
          type: 'object',
          properties: {
            same_person: { type: 'boolean' },
            reason: { type: 'string' },
          },
          required: ['same_person', 'reason'],
        },
      });

      return Response.json({ match: result?.same_person === true, reason: result?.reason || '' });
    }

    // mode === 'duplicate'
    const all = await base44.asServiceRole.entities.User.filter({ selfie_verified: true });
    const candidates = (Array.isArray(all) ? all : [])
      .filter((u) => u && u.id !== user.id && u.selfie_uri)
      .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
      .slice(0, MAX_EXISTING);

    if (!candidates.length) return Response.json({ duplicate: false, reason: '' });

    const otherUrls = [];
    for (let i = 0; i < candidates.length; i += SIGN_BATCH) {
      const chunk = candidates.slice(i, i + SIGN_BATCH);
      const signed = await Promise.allSettled(chunk.map((c) => signSelfie(base44, c.selfie_uri)));
      signed.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) otherUrls.push(r.value);
      });
    }

    for (let i = 0; i < otherUrls.length; i += COMPARE_BATCH) {
      const batch = otherUrls.slice(i, i + COMPARE_BATCH);
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a strict duplicate-account reviewer for a social app.

Image 1 is the verified selfie of a person trying to verify a NEW account.
Images 2 to ${batch.length + 1} are verified selfies belonging to existing accounts, in that order.

Decide whether image 1 shows the SAME PERSON as any of the other images.

Be strict: only answer duplicate when you are confident it is the same human face. Ignore lighting, camera angle, expression, hairstyle, hair length, glasses, makeup, filters and background. Different people can look similar at a glance, so compare actual facial structure.

matched_image is the image number of the matching existing account (2 for the first one), or 0 when there is no match.
Give a short, plain reason (max 12 words).`,
        file_urls: [selfieUrl, ...batch],
        response_json_schema: {
          type: 'object',
          properties: {
            duplicate: { type: 'boolean' },
            matched_image: { type: 'integer' },
            reason: { type: 'string' },
          },
          required: ['duplicate', 'matched_image', 'reason'],
        },
      });

      if (result?.duplicate === true) {
        // Do not leave a second account holding a verified badge.
        await base44.asServiceRole.entities.User.update(user.id, { selfie_verified: false }).catch(() => {});
        return Response.json({ duplicate: true, reason: result.reason || '' });
      }
    }

    return Response.json({ duplicate: false, reason: '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}