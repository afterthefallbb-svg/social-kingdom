import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users, Calendar, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

export default function ClickDetail() {
  const { id } = useParams();
  const [click, setClick] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!id) return;
    base44.entities.Click.get(id).then(setClick).catch(() => setClick(null));
    base44.entities.ClickMembership
      .filter({ click_id: id }, { limit: 50 })
      .then((page) => setMembers(page.items))
      .catch(() => setMembers([]));
    base44.entities.Event
      .filter({ click_id: id }, { sort: "start_time", limit: 50 })
      .then((page) => setEvents(page.items))
      .catch(() => setEvents([]));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <Link to="/clicks" aria-label="Back">
          <ArrowLeft size={22} color="#ffffff" />
        </Link>
        <h1 className="text-xl font-bold">Click</h1>
      </div>

      {click && (
        <div className="bg-white border-b-4 px-4 py-5 text-center" style={{ borderColor: FB }}>
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-4" style={{ borderColor: FB }}>
            {click.avatar_url ? (
              <Image src={click.avatar_url} fittingType="fill" className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: FB }}>
                {(click.name || "?").charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-3">{click.name}</h2>
          <p className="text-sm font-semibold mt-1 flex items-center justify-center gap-1" style={{ color: FB }}>
            <Users size={14} /> {click.member_count || members.length} members
          </p>
          {click.description && <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{click.description}</p>}
        </div>
      )}

      {/* Members — horizontal scroll of circular avatars */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-bold mb-2" style={{ color: FB }}>
          MEMBERS
        </h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {members.length === 0 && <p className="text-sm text-gray-400">No members yet.</p>}
          {members.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1 shrink-0 w-16">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2" style={{ borderColor: FB }}>
                {m.user_avatar ? (
                  <Image src={m.user_avatar} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold" style={{ color: FB }}>
                    {(m.user_name || "?").charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-gray-600 truncate max-w-[60px]">{m.user_name?.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming private events for this Click */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-bold mb-2" style={{ color: FB }}>
          UPCOMING EVENTS
        </h3>
        <div className="space-y-2">
          {events.length === 0 && <p className="text-sm text-gray-400">No private events scheduled yet.</p>}
          {events.map((ev) => {
            const cat = getCategory(ev.category);
            return (
              <div key={ev.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: cat.color + "22" }}>
                  {cat.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={11} /> {ev.start_time ? new Date(ev.start_time).toLocaleDateString() : "Soon"}
                    {ev.address && (
                      <>
                        <MapPin size={11} className="ml-1" /> {ev.address}
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}