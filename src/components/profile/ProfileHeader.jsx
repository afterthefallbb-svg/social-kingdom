import React, { useState } from "react";
import { Camera, FileText, Pencil, MessageCircle } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import PhotoEditor from "@/components/compose/PhotoEditor";

const FB = "#1877f2";

export default function ProfileHeader({ user, isMe, onUserUpdated, onEdit, onMessages }) {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(null); // 'avatar' | 'cover' | 'background' | null

  const name = user?.full_name || user?.friend_name || "CliQ Member";
  const initial = (name || "?").charAt(0).toUpperCase();
  const city = user?.location || user?.friend_city || "";
  const aboutPath = isMe ? "/profile/about" : `/profile/${user?.id}/about`;

  async function handleUploaded(url) {
    const fieldMap = { avatar: "avatar_url", cover: "cover_url", background: "background_photo" };
    const labelMap = { avatar: "Profile", cover: "Cover", background: "Background" };
    const which = uploading;
    setUploading(null);
    try {
      const updated = await base44.auth.updateMe({ [fieldMap[which]]: url });
      onUserUpdated?.(updated);
      toast({ title: `${labelMap[which]} photo updated` });
    } catch (e) {
      toast({ title: "Could not save", description: String(e.message || e) });
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Cover — tap to upload */}
      <button
        onClick={() => isMe && setUploading("cover")}
        className="relative w-full h-36 block"
        style={{ background: "linear-gradient(135deg,#1877f2,#42a5f5)" }}
        aria-label="Upload cover photo"
      >
        {user?.cover_url && (
          <Image src={user.cover_url} fittingType="fill" className="absolute inset-0 w-full h-full" />
        )}
        {isMe && (
          <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
            <Camera size={15} color={FB} />
          </span>
        )}
      </button>

      {/* Avatar + bio link */}
      <div className="px-4 -mt-12 flex items-end gap-4">
        <button
          onClick={() => isMe && setUploading("avatar")}
          className="relative w-24 h-24 rounded-full bg-white p-1 shadow shrink-0"
          aria-label="Upload profile photo"
        >
          <div
            className="w-full h-full rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-3xl font-bold"
            style={{ color: FB }}
          >
            {user?.avatar_url ? (
              <Image src={user.avatar_url} fittingType="fill" className="w-full h-full" />
            ) : (
              initial
            )}
          </div>
          {isMe && (
            <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow">
              <Camera size={14} color={FB} />
            </span>
          )}
        </button>

        <div className="pb-3 flex-1 flex justify-end">
          <button
            onClick={() => navigate(aboutPath)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white"
            style={{ background: FB }}
          >
            <FileText size={15} /> Bio
          </button>
        </div>
      </div>

      {/* Name + city/state */}
      <div className="px-4 pt-2">
        <h2 className="text-xl font-bold text-gray-900">{name}</h2>
        {city && <p className="text-sm text-gray-500">{city}</p>}
      </div>

      {/* Slim actions (current user only) */}
      {isMe && (
        <div className="px-4 py-3 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white"
            style={{ background: FB }}
          >
            <Pencil size={15} /> Edit Profile
          </button>
          <button
            onClick={onMessages}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold border"
            style={{ borderColor: FB, color: FB }}
          >
            <MessageCircle size={15} /> Messages
          </button>
          <button
            onClick={() => setUploading("background")}
            className="w-9 h-9 shrink-0 rounded-lg border flex items-center justify-center"
            style={{ borderColor: FB, color: FB }}
            aria-label="Upload background photo"
          >
            <Camera size={16} />
          </button>
        </div>
      )}

      {uploading && (
        <PhotoEditor
          label={uploading === "avatar" ? "Profile Photo" : uploading === "cover" ? "Cover Photo" : "Background Photo"}
          aspect={uploading === "avatar" ? "1 / 1" : "16 / 9"}
          onUploaded={handleUploaded}
          onClose={() => setUploading(null)}
        />
      )}
    </div>
  );
}