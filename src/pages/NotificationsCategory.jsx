import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotifList from "@/components/NotifList";
import { NOTIF_CATS } from "@/lib/notifications";

const FB = "#1877f2";

export default function NotificationsCategory() {
  const { category } = useParams();
  const navigate = useNavigate();
  const n = useNotifications();
  const cat = NOTIF_CATS.find((c) => c.id === category) || NOTIF_CATS[0];
  const items =
    cat.id === "friends" ? n.friends
      : cat.id === "relationship" ? n.relationships
      : cat.id === "events" ? n.events
      : cat.id === "posts" ? n.posts
      : cat.id === "cliqs" ? n.cliqs : [];

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/notifications")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="flex items-center gap-2">
          <span className="text-lg">{cat.emoji}</span>
          <span className="font-bold text-gray-900 text-lg">{cat.label}</span>
        </span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <div className="px-4 mt-5 space-y-2">
        {n.loading ? (
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        ) : (
          <NotifList category={cat.id} items={items} actions={n} acting={n.acting} navigate={navigate} />
        )}
      </div>
    </div>
  );
}