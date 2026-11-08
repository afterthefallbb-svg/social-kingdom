import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ArrowLeft, User, Navigation, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import EventDirectionsLink from "@/components/event/EventDirectionsLink";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Image } from "@/components/ui/sk-image";

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

const FB = "#1877f2";
const NAV_SIZE = 30;
const NAV_BOX = "w-12 h-12 flex items-center justify-center";

// Mirrors BottomNav so the three main destinations stay reachable while the
// event details sheet is open (the global nav is hidden behind the sheet).
function SheetNav() {
  return (
    <nav className="flex justify-around items-center pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-white">
      <NavLink to="/browse" aria-label="Browse">
        {({ isActive }) => (
          <span
            className={`${NAV_BOX} rounded-full border-2`}
            style={{ borderColor: FB, background: isActive ? FB : "rgba(24,119,242,0.25)" }}
          >
            <User size={NAV_SIZE} color="#ffffff" strokeWidth={2.25} />
          </span>
        )}
      </NavLink>
      <NavLink to="/map" aria-label="Map">
        {() => (
          <span className={`${NAV_BOX} rounded-full`} style={{ background: FB }}>
            <Navigation size={NAV_SIZE} color="#ffffff" strokeWidth={2.25} fill="#ffffff" />
          </span>
        )}
      </NavLink>
      <NavLink to="/create" aria-label="Create event">
        {() => (
          <span className={`${NAV_BOX} rounded-2xl`} style={{ background: FB }}>
            <Plus size={NAV_SIZE} color="#ffffff" strokeWidth={2.5} />
          </span>
        )}
      </NavLink>
    </nav>
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
            <div className="flex items-center justify-between px-3 pt-2">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1 text-black font-semibold"
                aria-label="Back"
              >
                <ArrowLeft size={20} className="text-black" />
                Back
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            <div className="px-5 pb-4 max-h-[66vh] overflow-y-auto">
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
                      <span className="text-[10px] text-gray-500 max-w-[48px] truncate flex items-center gap-0.5">
                        <span className="truncate">{a.user_name?.split(" ")[0]}</span>
                        <VerifiedBadge id={a.user_id} name={a.user_name} compact />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <EventDirectionsLink event={event} className="mt-5 py-3.5 text-base" filledIcon />
            </div>

            <SheetNav />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}