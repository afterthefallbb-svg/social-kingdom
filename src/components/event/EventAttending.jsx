import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Crown } from "lucide-react";

const FB = "#1877f2";

export default function EventAttending({ eventId, hostId, refreshKey }) {
  const [attendees, setAttendees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Attendance.filter({ event_id: eventId }, { limit: 100 })
      .then((p) => setAttendees(p.items))
      .catch(() => setAttendees([]));
  }, [eventId, refreshKey]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-bold text-gray-900 mb-2">
        People going · <span style={{ color: FB }}>{attendees.length}</span>
      </h3>
      {attendees.length === 0 ? (
        <p className="text-xs text-gray-400">Be the first to confirm attendance.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {attendees.map((a) => {
            const isHost = !!hostId && a.user_id === hostId;
            return (
              <button
                key={a.id}
                onClick={() =>
                  navigate(`/profile/${a.user_id}`, {
                    state: { name: a.user_name, avatar: a.user_avatar, city: a.user_city }
                  })
                }
                className="flex flex-col items-center gap-1 shrink-0 w-16"
              >
                <span className="relative">
                  <span
                    className="w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center text-sm font-bold"
                    style={{ borderColor: isHost ? FB : "#d1d5db", background: FB + "22", color: FB }}
                  >
                    {a.user_avatar ? (
                      <Image src={a.user_avatar} fittingType="fill" className="w-full h-full" />
                    ) : (
                      (a.user_name || "?").charAt(0)
                    )}
                  </span>
                  {isHost && (
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow border flex items-center justify-center"
                      style={{ borderColor: FB, color: FB }}
                      aria-label="Host"
                    >
                      <Crown size={11} />
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-gray-600 truncate w-full text-center">
                  {a.user_name?.split(" ")[0]}
                </span>
                {isHost && (
                  <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: FB }}>
                    Host
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}