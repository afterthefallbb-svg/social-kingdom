import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Keyless music search via the iTunes Search API. Returns 30-second preview
// clips (m4a) plus artwork + metadata — no API key required. Full-song
// playback needs a licensed provider (Spotify/Apple Music), not this endpoint.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const term = (body.term || "").toString().trim();
    if (!term || term.length > 120) {
      return Response.json({ error: "Invalid search term" }, { status: 400 });
    }

    const url =
      "https://itunes.apple.com/search?term=" +
      encodeURIComponent(term) +
      "&media=music&entity=song&limit=25";

    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return Response.json({ error: "Music search failed" }, { status: 502 });
    const data = await r.json();

    const results = (data.results || [])
      .map((t) => ({
        trackId: t.trackId,
        trackName: t.trackName,
        artistName: t.artistName,
        collectionName: t.collectionName,
        artworkUrl: (t.artworkUrl100 || "").replace("100x100", "300x300"),
        previewUrl: t.previewUrl,
      }))
      .filter((t) => t.previewUrl);

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}