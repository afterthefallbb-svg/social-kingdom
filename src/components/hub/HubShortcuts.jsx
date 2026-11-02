import React from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarDays, ChevronRight, Folder, Gamepad2, Globe, Megaphone, MessageSquare, Music2, Newspaper, Search, ShoppingBag, SlidersHorizontal, UserRound, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import KingdomSurface from "@/components/hub/KingdomSurface";

const links = [
  { label: "Feed", to: "/feed", icon: Newspaper, tone: "blue" },
  { label: "Messages", to: "/messages", icon: MessageSquare, tone: "violet", badge: "messages" },
  { label: "Notifications", to: "/notifications", icon: Bell, tone: "gold", badge: "notifications" },
  { label: "Groups", to: "/groups", icon: Users, tone: "blue" },
  { label: "Friends", to: "/profile", icon: UserRound, tone: "teal" },
  { label: "Explore", to: "/", icon: Globe, tone: "magenta" },
  { label: "Buy/Sell", to: "/buy-sell", icon: ShoppingBag, tone: "teal" },
  { label: "Music", to: "/music", icon: Music2, tone: "violet" },
  { label: "Games", to: "/games", icon: Gamepad2, tone: "blue" },
  { label: "Announcements", to: "/announcements", icon: Megaphone, tone: "gold" },
];

export default function HubShortcuts({ me }) {
  const { data: badges = {} } = useQuery({
    queryKey: ["hub-unread", me?.id], enabled: !!me?.id,
    queryFn: async () => {
      const [messages, notifications] = await Promise.all([
        base44.entities.Message.count({ member_ids: me.id, sender_id: { $ne: me.id }, read: false }),
        base44.entities.Notification.count({ user_id: me.id, read: false }),
      ]);
      return { messages, notifications };
    },
  });
  return (
    <div className="kingdom-shortcuts">
      <div className="kingdom-planning">
        {[{ label: "Projects", to: "/projects", icon: Folder }, { label: "Planner", to: "/planner", icon: CalendarDays }].map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to} className="kingdom-planning-link"><KingdomSurface /><Icon /><span>{label}</span><ChevronRight /></Link>
        ))}
      </div>
      <nav className="kingdom-apps no-scrollbar" aria-label="Social hub shortcuts">
        {links.map(({ label, to, icon: Icon, tone, badge }) => (
          <Link key={label} to={to} className={`kingdom-app kingdom-app-${tone}`}><KingdomSurface /><Icon /><span>{label}</span>{badges[badge] > 0 && <b className="kingdom-unread">{badges[badge] > 99 ? "99+" : badges[badge]}</b>}</Link>
        ))}
      </nav>
      <Link to="/" className="kingdom-search" aria-label="Search and filter nearby events"><KingdomSurface /><Search /><span>Search...</span><SlidersHorizontal /></Link>
    </div>
  );
}