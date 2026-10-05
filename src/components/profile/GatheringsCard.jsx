import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Globe, Lock, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";

const FB = "#1877f2";

export default function GatheringsCard({ me }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!me?.id) {
        setLoading(false);
        return;
      }
      try {
        const att = await base44.entities.Attendance.filter({ user_id: me.id }, { limit: 50 });
        const ids = att.items.map((a) => a.event_id).filter(Boolean);
        if (ids.length) {
          const ev = await base44.entities.Event.filter({ id: { $in: ids } }, { limit: 50 });
          setEvents(ev.items);
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    })();
  }, [me?.id]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">My Gatherings</h3>
        <Link to="/" className="inline-flex items-center text-sm font-semibold" style={{ color: FB }}>
          Explore <ChevronRight size={14} />
        </Link>
      </div>
      <div className="space-y-2 mt-2">
        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {!loading && events.length === 0 && (
          <p className="text-sm text-gray-400">You haven't confirmed any gatherings yet.</p>
        )}
        {events.map((ev) => {
          const cat = getCategory(ev.category);
          const personal = ev.visibility === "personal";
          return (
            <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: cat.color + "22" }}
              >
                {cat.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{ev.title}</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1 flex-wrap">
                  <Calendar size={11} /> {ev.start_time ? new Date(ev.start_time).toLocaleDateString() : "Soon"}
                  <span className="ml-1 inline-flex items-center gap-0.5 font-semibold" style={{ color: personal ? "#6b7280" : FB }}>
                    {personal ? (
                      <>
                        <Lock size={10} /> Personal
                      </>
                    ) : (
                      <>
                        <Globe size={10} /> Public
                      </>
                    )}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}