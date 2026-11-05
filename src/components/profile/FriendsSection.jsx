import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Image } from "@/components/ui/sk-image";

const FB = "#1877f2";

export default function FriendsSection({ friends }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const shown = friends.slice(0, 5);

  return (
    <div className="p-4" style={{ textShadow: "0 1px 4px rgba(255,255,255,0.95)" }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="font-bold text-gray-900 flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
            style={{ background: FB }}
          >
            😊
          </span>
          Friends
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3">
          {shown.length === 0 ? (
            <p className="text-xs text-gray-400">No friends yet.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {shown.map((f) => (
                <button
                  key={f.id}
                  onClick={() => navigate(`/profile/${f.friend_id}`)}
                  className="flex flex-col items-center gap-1 shrink-0 w-16"
                >
                  <span
                    className="w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center text-sm font-bold"
                    style={{ borderColor: FB, background: FB + "22", color: FB }}
                  >
                    {f.friend_avatar ? (
                      <Image src={f.friend_avatar} fittingType="fill" className="w-full h-full" />
                    ) : (
                      (f.friend_name || "?").charAt(0)
                    )}
                  </span>
                  <span className="text-[10px] text-gray-600 text-center leading-tight truncate w-full">
                    {f.friend_name?.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}