import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Navigation, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import { openDirections } from "@/lib/directions";
import { Image } from "@/components/ui/image";

function Tag({ children, color }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
      style={{ background: color }}
    >
      {children}
    </span>
  );
}

export default function EventDetailsSheet({ event, onClose }) {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    if (!event) {
      setAttendees([]);
      return;
    }
    base44.entities.Attendance.filter({ event_id: event.id }, { limit: 50 })
      .then((page) => setAttendees(page.items))
      .catch(() => setAttendees([]));
  }, [event]);

  const cat = event ? getCategory(event.category) : null;

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/45 z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-[1001] bg-white rounded-t-3xl shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mt-3" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              aria-label="Close"
            >
              <X size={16} className="text-gray-600" />
            </button>

            <div className="px-5 pb-7 max-h-[78vh] overflow-y-auto">
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-base"
                  style={{ background: cat.color + "22" }}
                >
                  {cat.emoji}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: cat.color }}>
                  {cat.label}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-2 leading-tight">{event.title}</h2>

              {event.address && (
                <div className="flex items-center gap-1 mt-1.5 text-sm text-gray-500">
                  <MapPin size={14} /> {event.address}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {event.age_bracket && <Tag color="#7c3aed">{event.age_bracket}</Tag>}
                {event.dress_code && <Tag color="#059669">{event.dress_code}</Tag>}
                {event.tags?.map((t) => (
                  <Tag key={t} color="#1877f2">{t}</Tag>
                ))}
              </div>

              {event.description && (
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{event.description}</p>
              )}

              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">
                  Going · <span className="text-[#1877f2]">{attendees.length}</span>
                </p>
                <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
                  {attendees.length === 0 && (
                    <p className="text-xs text-gray-400">Be the first to confirm attendance.</p>
                  )}
                  {attendees.map((a) => (
                    <div key={a.id} className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#1877f2]">
                        {a.user_avatar ? (
                          <Image src={a.user_avatar} fittingType="fill" className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center text-xs font-bold text-[#1877f2]">
                            {(a.user_name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 max-w-[48px] truncate">{a.user_name?.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => openDirections(event)}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-white font-semibold text-base"
                style={{ background: "#1877f2" }}
              >
                <Navigation size={18} color="#ffffff" fill="#ffffff" />
                Get Directions
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}