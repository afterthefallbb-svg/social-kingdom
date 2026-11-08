import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarDays, Folder, Gamepad2, Megaphone, MessageSquare, Music2, Newspaper, ShoppingBag, UserRound, Users } from "lucide-react";
import FriendsBrowserDialog from "@/components/friends/FriendsBrowserDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import KingdomSurface from "@/components/hub/KingdomSurface";

const links = [
  { label: "Feed", to: "/feed", icon: Newspaper, tone: "blue" },
  { label: "Messages", to: "/messages", icon: MessageSquare, tone: "violet", badge: "messages" },
  { label: "Notifications", to: "/notifications", icon: Bell, tone: "gold", badge: "notifications" },
  { label: "Groups", to: "/groups", icon: Users, tone: "blue" },
  { label: "Friends", icon: UserRound, tone: "teal", action: "friends" },
  { label: "Buy/Sell", to: "/buy-sell", icon: ShoppingBag, tone: "teal" },
  { label: "Music", to: "/music", icon: Music2, tone: "violet" },
  { label: "Games", to: "/games", icon: Gamepad2, tone: "blue" },
  { label: "Announcements", to: "/announcements", icon: Megaphone, tone: "gold" },
  { label: "Projects", to: "/projects", icon: Folder, tone: "indigo" },
  { label: "Planner", to: "/planner", icon: CalendarDays, tone: "magenta" },
];

/* The swipeable strip of app icons. The hub and the event map share this one
   row, so both screens carry exactly the same shortcuts and unread bubbles. */
export default function HubIconRow({ me }) {
  const [friendsOpen, setFriendsOpen] = useState(false);
  const queryClient = useQueryClient();
  const badgeKey = ["hub-unread", me?.id];

  useEffect(() => {
    if (!me?.id) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: badgeKey });
    const unsubs = [
      base44.entities.Message.subscribe(refresh),
      base44.entities.Notification.subscribe(refresh),
      base44.entities.Friendship.subscribe(refresh),
      base44.entities.Relationship.subscribe(refresh),
      base44.entities.Invite.subscribe(refresh),
    ];
    return () => unsubs.forEach((unsub) => unsub?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  const { data: badges = {} } = useQuery({
    queryKey: badgeKey, enabled: !!me?.id,
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const [messages, friendReqs, relReqs, invites, postNotifs] = await Promise.all([
        base44.entities.Message.count({ member_ids: me.id, sender_id: { $ne: me.id }, read: false }),
        base44.entities.Friendship.count({ friend_id: me.id, status: "pending" }).catch(() => 0),
        base44.entities.Relationship.count({ partner_id: me.id, status: "pending" }).catch(() => 0),
        base44.entities.Invite.count({ invitee_id: me.id, status: "pending" }).catch(() => 0),
        base44.entities.Notification.count({ user_id: me.id, read: false, type: { $in: ["event_post", "click_post"] } }).catch(() => 0),
      ]);
      return { messages, notifications: friendReqs + relReqs + invites + postNotifs };
    },
  });

  return (
    <>
      <nav className="kingdom-apps no-scrollbar" aria-label="Social hub shortcuts">
        {links.map(({ label, to, icon: Icon, tone, badge, action }) => {
          const inner = <><KingdomSurface /><Icon /><span>{label}</span>{badges[badge] > 0 && <b className="kingdom-unread">{badges[badge] > 99 ? "99+" : badges[badge]}</b>}</>;
          return action === "friends"
            ? <button key={label} type="button" onClick={() => setFriendsOpen(true)} className={`kingdom-app kingdom-app-${tone}`}>{inner}</button>
            : <Link key={label} to={to} className={`kingdom-app kingdom-app-${tone}`}>{inner}</Link>;
        })}
      </nav>
      <FriendsBrowserDialog open={friendsOpen} onClose={() => setFriendsOpen(false)} me={me} />
    </>
  );
}