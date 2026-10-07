import React, { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import PhotoUpload from "@/components/profile/PhotoUpload";

const FB = "#1877f2";

export default function EventPhotos({ eventId }) {
  const [photos, setPhotos] = useState([]);
  const [me, setMe] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
    base44.entities.EventPhoto.filter({ event_id: eventId }, { sort: "-created_date", limit: 100 })
      .then((p) => setPhotos(p.items))
      .catch(() => setPhotos([]));
  }, [eventId]);

  async function onUploaded(url, type) {
    setUploading(false);
    try {
      await base44.entities.EventPhoto.create({
        event_id: eventId,
        url,
        type: type === "video" ? "video" : "image",
        user_id: me.id,
        user_name: me.full_name
      });
      const p = await base44.entities.EventPhoto.filter({ event_id: eventId }, { sort: "-created_date", limit: 100 });
      setPhotos(p.items);
      toast({ title: "Photo added" });
    } catch (e) {
      toast({ title: "Could not save", description: String(e.message || e) });
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900">Photos & Videos</h3>
        <button
          onClick={() => setUploading(true)}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
          style={{ background: FB }}
        >
          <Camera size={14} /> Upload
        </button>
      </div>

      {photos.length === 0 ? (
        <p className="text-xs text-gray-400">No photos yet. Add the first one!</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((p) => (
            <div key={p.id} className="aspect-square rounded-lg overflow-hidden">
              {p.type === "video" ? (
                <video src={p.url} className="w-full h-full object-cover" controls />
              ) : (
                <Image src={p.url} fittingType="fill" className="w-full h-full" />
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <PhotoUpload
          label="Event Photo"
          allowVideo
          onUploaded={onUploaded}
          onClose={() => setUploading(false)}
        />
      )}
    </div>
  );
}