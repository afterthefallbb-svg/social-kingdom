import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft } from "lucide-react";
import { Image } from "@/components/ui/sk-image";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EventsSection from "@/components/profile/EventsSection";
import EventsAttendedSection from "@/components/profile/EventsAttendedSection";
import CliQsSection from "@/components/profile/CliQsSection";
import FriendsSection from "@/components/profile/FriendsSection";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import GetVerifiedCard from "@/components/profile/GetVerifiedCard";
import VideoGallery from "@/components/video/VideoGallery";
import ProfilePhotos from "@/components/profile/ProfilePhotos";
import KingdomBackdrop from "@/components/theme/KingdomBackdrop";
import { usersByIds } from "@/lib/users";

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const passed = state || {};
  const [me, setMe] = useState(null);
  const [user, setUser] = useState(
    id && passed.name ? { id, full_name: passed.name, avatar_url: passed.avatar, location: passed.city } : null
  );
  const [isMe, setIsMe] = useState(true);
  const [events, setEvents] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [editing, setEditing] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = await base44.auth.me().catch(() => null);
      if (!active) return;
      // Own profile with no session: ask to log in instead of rendering an empty page.
      if (!current && !id) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
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
        if (!u && passed.name) {
          u = { id: targetId, full_name: passed.name, avatar_url: passed.avatar, location: passed.city };
        }
        if (!u) {
          const fr = await base44.entities.Friendship.filter({ friend_id: targetId }, { limit: 1 }).catch(() => ({ items: [] }));
          const f = fr.items[0];
          if (f) {
            u = { id: targetId, full_name: f.friend_name, avatar_url: f.friend_avatar, location: f.friend_city };
          } else {
            const att = await base44.entities.Attendance.filter({ user_id: targetId }, { limit: 1 }).catch(() => ({ items: [] }));
            const a = att.items[0];
            if (a) {
              u = { id: targetId, full_name: a.user_name, avatar_url: a.user_avatar };
            } else {
              const cm = await base44.entities.ClickMembership.filter({ user_id: targetId }, { limit: 1 }).catch(() => ({ items: [] }));
              const c = cm.items[0];
              u = c
                ? { id: targetId, full_name: c.user_name, avatar_url: c.user_avatar }
                : { id: targetId, full_name: "CliQ Member" };
            }
          }
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
      // Friend rows store a snapshot of the name/photo at request time — show
      // the live profile instead so a changed photo is never blank or stale.
      const live = await usersByIds(frres.items.map((f) => f.friend_id));
      const withLive = frres.items.map((f) => {
        const u = live[f.friend_id];
        return u
          ? {
              ...f,
              friend_name: u.full_name || f.friend_name,
              friend_avatar: u.avatar_url || f.friend_avatar,
              friend_city: u.location || f.friend_city,
            }
          : f;
      });
      if (active) setFriends(withLive);
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
        {bg && !bgFailed ? (
          <Image src={bg} fittingType="fill" className="w-full h-full" onError={() => setBgFailed(true)} />
        ) : (
          <KingdomBackdrop />
        )}
      </div>

      <div className="relative z-10 p-3 pt-4 space-y-3 max-w-2xl mx-auto">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="flex items-center gap-1 text-sm font-semibold text-black drop-shadow">
          <ChevronLeft size={22} /> Back
        </button>
        <ProfileHeader
          user={user}
          isMe={isMe}
          onUserUpdated={setUser}
          onEdit={() => setEditing(true)}
          onMessages={() => navigate("/messages")}
        />

        {isMe && (
          <GetVerifiedCard
            me={me}
            onUpdated={(u) => {
              setMe(u);
              setUser(u);
            }}
          />
        )}

        <div className="space-y-3">
          <div className="space-y-3">
            <EventsSection events={upcoming} onSelect={(e) => navigate(`/event/${e.id}`)} />
            <EventsAttendedSection events={past} onSelect={(e) => navigate(`/event/${e.id}`)} />
          </div>
          <div className="space-y-3">
            <CliQsSection clicks={clicks} />
            <FriendsSection friends={friends} />
          </div>
        </div>

        {user?.id && (
          <VideoGallery title={isMe ? "My Videos" : "Videos"} scope={{ user_id: user.id }} />
        )}

        {user?.id && (
          <ProfilePhotos
            userId={user.id}
            title={isMe ? "My Photos" : "Photos"}
            current={{ avatar: user.avatar_url, cover: user.cover_url }}
          />
        )}
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