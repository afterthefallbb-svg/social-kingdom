import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Inspects a captured selfie and confirms it really shows a live, three-dimensional
// human face before the account can be verified. Rejects floors, objects, scenery,
// photos of photos, drawings and anything without a clear real face.
const PROMPT = `You are a strict identity-verification inspector for a social app.

The attached image is supposed to be a live selfie of the person creating an account, captured with a phone camera.

Decide whether the image clearly shows a real, live, three-dimensional human FACE.

ACCEPT only when all of these are true:
- Exactly one human face is present and clearly visible.
- The face is the main subject and fills most of the frame.
- Eyes, nose and mouth are recognizable, well lit and in focus.

REJECT when any of these is true:
- The image shows a floor, ceiling, wall, sky, landscape, street, or any scene without a face.
- The image shows an object, food, an animal, a hand, a torso, legs, or any body part other than a face.
- The image is a printed photograph, a picture on a screen, a drawing, an illustration, a cartoon, a 3D render, a mask, or a statue.
- No face is discernible, or the face is too small, too dark, too blurry, or covered.

Be strict. If you are not certain a real human face is present, reject it.
Give a short, plain reason (max 12 words) a normal person would understand.`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const signedUrl = typeof body.signed_url === 'string' ? body.signed_url : '';
    if (!signedUrl || !/^https:\/\//i.test(signedUrl)) {
      return Response.json({ error: 'signed_url is required' }, { status: 400 });
    }
    const fileUri = typeof body.file_uri === 'string' ? body.file_uri : '';

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: PROMPT,
      file_urls: [signedUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          verified: { type: 'boolean' },
          reason: { type: 'string' }
        },
        required: ['verified', 'reason']
      }
    });

    const verified = result?.verified === true;

    if (verified) {
      // The stored selfie is the reference for duplicate-account and profile-photo checks.
      await base44.asServiceRole.entities.User.update(user.id, {
        selfie_verified: true,
        ...(fileUri ? { selfie_uri: fileUri } : {}),
      }).catch(() => {});
    }

    return Response.json({ verified, reason: result?.reason || '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}