import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft } from "lucide-react";
import { Image } from "@/components/ui/image";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EventsSection from "@/components/profile/EventsSection";
import EventsAttendedSection from "@/components/profile/EventsAttendedSection";
import CliQsSection from "@/components/profile/CliQsSection";
import FriendsSection from "@/components/profile/FriendsSection";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [me, setMe] = useState(null);
  const [user, setUser] = useState(null);
  const [isMe, setIsMe] = useState(true);
  const [events, setEvents] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = await base44.auth.me().catch(() => null);
      if (!active) return;
      setMe(current);
      const targetId = id || current?.id;
      const viewingMe = !id || id === current?.id;
      setIsMe(viewingMe);

      if (viewingMe) {
        setUser(current);
      } else {
        let u = null;
        try {
          u = await base44.entities.User.get(targetId);
        } catch {
          u = null;
        }
        if (!u) {
          const fr = await base44.entities.Friendship.filter({ friend_id: targetId }, { limit: 1 });
          const f = fr.items[0];
          u = f
            ? { id: targetId, friend_name: f.friend_name, avatar_url: f.friend_avatar, location: f.friend_city }
            : { id: targetId, friend_name: "CliQ Member" };
        }
        setUser(u);
      }

      const att = await base44.entities.Attendance.filter({ user_id: targetId }, { limit: 100 });
      const ids = att.items.map((a) => a.event_id).filter(Boolean);
      let evs = [];
      if (ids.length) {
        const res = await base44.entities.Event.filter({ id: { $in: ids } }, { limit: 100 });
        evs = res.items;
      }
      if (active) setEvents(evs);

      const mem = await base44.entities.ClickMembership.filter({ user_id: targetId }, { limit: 50 });
      const cids = mem.items.map((m) => m.click_id).filter(Boolean);
      let cls = [];
      if (cids.length) {
        const res = await base44.entities.Click.filter({ id: { $in: cids } }, { limit: 50 });
        cls = res.items;
      }
      if (active) setClicks(cls);

      const frres = await base44.entities.Friendship.filter(
        { user_id: targetId, status: "accepted" },
        { limit: 50 }
      );
      if (active) setFriends(frres.items);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const now = new Date();
  const upcoming = events
    .filter((e) => !e.start_time || new Date(e.start_time) >= now)
    .sort((a, b) => new Date(a.start_time || 0) - new Date(b.start_time || 0));
  const past = events
    .filter((e) => e.start_time && new Date(e.start_time) < now)
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  const bg = user?.background_photo;

  return (
    <div className="min-h-screen relative pb-28">
      {/* Fixed full-screen background photo — stays in place while content scrolls */}
      <div className="fixed inset-0 z-0">
        {bg ? (
          <Image src={bg} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-white" />
        )}
      </div>

      <div className="relative z-10 p-3 pt-4 space-y-3 max-w-2xl mx-auto">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="flex items-center gap-1 text-sm font-semibold text-white drop-shadow">
          <ChevronLeft size={22} /> Back
        </button>
        <ProfileHeader
          user={user}
          isMe={isMe}
          onUserUpdated={setUser}
          onEdit={() => setEditing(true)}
          onMessages={() => navigate("/messages")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-3">
            <EventsSection events={upcoming} onSelect={(e) => navigate(`/event/${e.id}`)} />
            <EventsAttendedSection events={past} onSelect={(e) => navigate(`/event/${e.id}`)} />
          </div>
          <div className="space-y-3">
            <CliQsSection clicks={clicks} />
            <FriendsSection friends={friends} />
          </div>
        </div>
      </div>

      {editing && (
        <EditProfileDialog
          me={me}
          onClose={() => setEditing(false)}
          onSaved={(u) => { setMe(u); setUser(u); }}
        />
      )}
    </div>
  );
}