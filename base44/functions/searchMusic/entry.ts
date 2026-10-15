// Keyless music search across two databases: iTunes Search API (primary)
// and Deezer Search API (fallback). Both return 30-second preview clips plus
// artwork + metadata, no API key required. Full-song playback needs a
// licensed provider (Spotify/Apple Music), not this endpoint.
export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const term = (body.term || "").toString().trim();
    if (!term || term.length > 120) {
      return Response.json({ error: "Invalid search term" }, { status: 400 });
    }

    let results = [];

    // Primary: iTunes Search API — millions of tracks, 30s m4a previews.
    try {
      const itunesUrl =
        "https://itunes.apple.com/search?term=" +
        encodeURIComponent(term) +
        "&media=music&entity=song&limit=25";
      const r = await fetch(itunesUrl, { signal: AbortSignal.timeout(10000) });
      if (r.ok) {
        const data = await r.json();
        results = (data.results || [])
          .map((t) => ({
            trackId: "it_" + t.trackId,
            trackName: t.trackName,
            artistName: t.artistName,
            collectionName: t.collectionName,
            artworkUrl: (t.artworkUrl100 || "").replace("100x100", "300x300"),
            previewUrl: t.previewUrl,
          }))
          .filter((t) => t.previewUrl);
      }
    } catch {}

    // Fallback: Deezer Search API if iTunes returned nothing.
    if (results.length === 0) {
      try {
        const dzUrl =
          "https://api.deezer.com/search?q=" +
          encodeURIComponent(term) +
          "&limit=25";
        const dr = await fetch(dzUrl, { signal: AbortSignal.timeout(10000) });
        if (dr.ok) {
          const dzData = await dr.json();
          results = (dzData.data || [])
            .map((t) => ({
              trackId: "dz_" + t.id,
              trackName: t.title,
              artistName: (t.artist && t.artist.name) || "",
              collectionName: (t.album && t.album.title) || "",
              artworkUrl: (t.album && t.album.cover_big) || "",
              previewUrl: t.preview,
            }))
            .filter((t) => t.previewUrl);
        }
      } catch {}
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}