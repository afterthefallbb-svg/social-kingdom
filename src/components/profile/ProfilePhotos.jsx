import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

// Three albums: profile pics, cover images, and everything added from
// "Add Photos". The current avatar/cover always appear even when they were
// uploaded before albums existed.
const ALBUMS = [
  { id: "profile", label: "Profile Pics", emoji: "🧑" },
  { id: "cover", label: "Cover Photos", emoji: "🖼️" },
  { id: "gallery", label: "My Photos", emoji: "📷" }
];

export default function ProfilePhotos({ userId, title = "My Photos", current = {} }) {
  const [photos, setPhotos] = useState([]);
  const [album, setAlbum] = useState("profile");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    base44.entities.ProfilePhoto
      .filter({ user_id: userId }, { sort: "-created_date", limit: 200 })
      .then((p) => active && setPhotos(p.items))
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    const unsubscribe = base44.entities.ProfilePhoto.subscribe((event) => {
      if (event.data?.user_id !== userId) return;
      if (event.type === "delete") {
        setPhotos((list) => list.filter((p) => p.id !== event.id));
      } else if (event.type === "create") {
        setPhotos((list) => (list.some((p) => p.id === event.id) ? list : [event.data, ...list]));
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId]);

  const stored = photos.filter((p) => p.album === album).map((p) => p.url);
  const currentUrl = album === "profile" ? current.avatar : album === "cover" ? current.cover : null;
  const urls = [currentUrl, ...stored].filter((u, i, all) => u && all.indexOf(u) === i);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <div className="flex gap-2 mb-3">
        {ALBUMS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAlbum(a.id)}
            className={`flex-1 rounded-full py-1.5 text-[11px] font-bold border ${
              album === a.id ? "text-white border-transparent" : "text-gray-600"
            }`}
            style={album === a.id ? { background: "#1877f2" } : { borderColor: "#e5e7eb" }}
          >
            <span className="mr-1">{a.emoji}</span>{a.label}
          </button>
        ))}
      </div>
      {urls.length ? (
        <div className="grid grid-cols-3 gap-1.5">
          {urls.map((url, i) => (
            <div key={`${url}-${i}`} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image src={url} fittingType="fill" className="w-full h-full" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          {loaded ? "No photos in this album yet." : "Loading photos…"}
        </p>
      )}
    </div>
  );
}