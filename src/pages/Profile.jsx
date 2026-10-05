import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Calendar, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [going, setGoing] = useState([]);
  const [clicks, setClicks] = useState([]);

  useEffect(() => {
    base44.auth
      .me()
      .then(setMe)
      .catch(() => setMe(null));
    base44.entities.Attendance
      .filter({ user_id: "demo-me" }, { limit: 20 })
      .then((page) => setGoing(page.items))
      .catch(() => setGoing([]));
    base44.entities.Click
      .filter({}, { limit: 20 })
      .then((page) => setClicks(page.items))
      .catch(() => setClicks([]));
  }, []);

  const name = me?.full_name || me?.email || "Meet Me Member";
  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      {/* Facebook-style blue header */}
      <div className="text-white px-4 pt-6 pb-20" style={{ background: FB }}>
        <h1 className="text-2xl font-bold">Meet Me</h1>
        <p className="text-sm text-blue-100 mt-0.5">Your community network</p>
      </div>

      {/* Profile card */}
      <div className="px-4 -mt-14">
        <div className="bg-white rounded-2xl shadow-md border-t-4 overflow-hidden" style={{ borderColor: FB }}>
          <div className="flex items-center gap-4 p-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 border-4 flex items-center justify-center text-3xl font-bold" style={{ borderColor: FB, color: FB }}>
              {initial}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{name}</h2>
              <p className="text-sm text-gray-500">Walla Walla, WA</p>
              <Link
                to="/clicks"
                className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold"
                style={{ color: FB }}
              >
                <Users size={15} /> My Clicks <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Clicks preview */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-bold text-gray-700 mb-2" style={{ color: FB }}>
          YOUR CLICKS
        </h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {clicks.length === 0 && <p className="text-sm text-gray-400">No Clicks yet.</p>}
          {clicks.map((c) => (
            <Link
              key={c.id}
              to={`/clicks/${c.id}`}
              className="shrink-0 w-28 bg-white rounded-xl border border-gray-200 p-3 text-center"
            >
              <div className="w-14 h-14 rounded-full mx-auto overflow-hidden border-2" style={{ borderColor: FB }}>
                {c.avatar_url ? (
                  <Image src={c.avatar_url} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold" style={{ color: FB }}>
                    {(c.name || "?").charAt(0)}
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-800 mt-2 truncate">{c.name}</p>
              <p className="text-[11px] text-gray-400">{c.member_count || 0} members</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Events I'm attending */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-bold mb-2" style={{ color: FB }}>
          EVENTS YOU'RE ATTENDING
        </h3>
        <div className="space-y-2">
          {going.length === 0 && (
            <p className="text-sm text-gray-400">You haven't confirmed any gatherings yet.</p>
          )}
          {going.map((a) => {
            const cat = getCategory("sports");
            return (
              <div key={a.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: cat.color + "22" }}>
                  {cat.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.user_name || "Gathering"}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={11} /> Confirmed
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