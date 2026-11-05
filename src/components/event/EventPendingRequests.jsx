import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/sk-image";
import { Check, X } from "lucide-react";

const FB = "#1877f2";

export default function EventPendingRequests({ eventId, hostId, refreshKey, onChanged }) {
  const [reqs, setReqs] = useState([]);

  useEffect(() => {
    base44.entities.Attendance.filter({ event_id: eventId, status: "interested" }, { limit: 50 })
      .then((p) => setReqs(p.items))
      .catch(() => setReqs([]));
  }, [eventId, refreshKey]);

  if (!reqs.length) return null;

  async function approve(a) {
    try {
      await base44.entities.Attendance.update(a.id, { status: "confirmed" });
      await base44.entities.Notification.create({
        user_id: a.user_id,
        type: "system",
        title: "You're approved!",
        body: "Your attendance request was approved.",
        target_type: "event",
        target_id: eventId,
        actor_id: hostId,
      }).catch(() => {});
      setReqs((r) => r.filter((x) => x.id !== a.id));
      onChanged?.();
    } catch {}
  }

  async function decline(a) {
    try {
      await base44.entities.Attendance.delete(a.id);
      setReqs((r) => r.filter((x) => x.id !== a.id));
      onChanged?.();
    } catch {}
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-bold text-gray-900 mb-2">
        Pending requests · <span style={{ color: FB }}>{reqs.length}</span>
      </h3>
      <div className="space-y-2">
        {reqs.map((a) => (
          <div key={a.id} className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-bold shrink-0"
              style={{ color: FB }}
            >
              {a.user_avatar ? (
                <Image src={a.user_avatar} fittingType="fill" className="w-full h-full" />
              ) : (
                (a.user_name || "?").charAt(0)
              )}
            </span>
            <span className="flex-1 text-sm font-medium text-gray-800 truncate">{a.user_name}</span>
            <button
              onClick={() => approve(a)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ background: FB }}
              aria-label="Approve"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => decline(a)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gray-400 shrink-0"
              aria-label="Decline"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}