import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

export default function EventAttending({ eventId }) {
  const [attendees, setAttendees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Attendance.filter({ event_id: eventId }, { limit: 100 })
      .then((p) => setAttendees(p.items))
      .catch(() => setAttendees([]));
  }, [eventId]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-bold text-gray-900 mb-2">
        People going · <span style={{ color: FB }}>{attendees.length}</span>
      </h3>
      {attendees.length === 0 ? (
        <p className="text-xs text-gray-400">Be the first to confirm attendance.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {attendees.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(`/profile/${a.user_id}`)}
              className="flex flex-col items-center gap-1 shrink-0 w-16"
            >
              <span
                className="w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center text-sm font-bold"
                style={{ borderColor: FB, background: FB + "22", color: FB }}
              >
                {a.user_avatar ? (
                  <Image src={a.user_avatar} fittingType="fill" className="w-full h-full" />
                ) : (
                  (a.user_name || "?").charAt(0)
                )}
              </span>
              <span className="text-[10px] text-gray-600 truncate w-full text-center">
                {a.user_name?.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}