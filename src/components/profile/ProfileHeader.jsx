import React from "react";
import { Pencil, MessageCircle } from "lucide-react";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

export default function ProfileHeader({ me, onEdit, onMessages }) {
  const name = me?.full_name || me?.email || "CliQ Member";
  const initial = (name || "?").charAt(0).toUpperCase();
  const location = me?.location || "Walla Walla, WA";

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Cover */}
      <div className="h-36 relative" style={{ background: "linear-gradient(135deg,#1877f2,#42a5f5)" }}>
        {me?.cover_url && (
          <Image src={me.cover_url} fittingType="fill" className="absolute inset-0 w-full h-full" />
        )}
      </div>
      {/* Avatar + name */}
      <div className="px-4 -mt-12 flex items-end gap-4">
        <div className="w-24 h-24 rounded-full bg-white p-1 shadow shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-3xl font-bold" style={{ color: FB }}>
            {me?.avatar_url ? (
              <Image src={me.avatar_url} fittingType="fill" className="w-full h-full" />
            ) : (
              initial
            )}
          </div>
        </div>
        <div className="pb-3 min-w-0 flex-1">
          <h2 className="text-xl font-bold text-gray-900 truncate">{name}</h2>
          <p className="text-sm text-gray-500 truncate">{location}</p>
        </div>
      </div>
      {/* Actions */}
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
      </div>
    </div>
  );
}