import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotifList from "@/components/NotifList";
import { NOTIF_CATS } from "@/lib/notifications";

const FB = "#1877f2";
const TOP = 5;

export default function Notifications() {
  const navigate = useNavigate();
  const n = useNotifications();
  const itemsFor = (cat) =>
    cat === "friends" ? n.friends
      : cat === "relationship" ? n.relationships
      : cat === "events" ? n.events
      : cat === "posts" ? n.posts
      : cat === "cliqs" ? n.cliqs : [];

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Notifications</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <div className="px-4 mt-5 space-y-6">
        {n.loading ? (
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        ) : (
          NOTIF_CATS.map((c) => {
            const items = itemsFor(c.id);
            const top = items.slice(0, TOP);
            return (
              <div key={c.id}>
                <button
                  onClick={() => navigate(`/notifications/${c.id}`)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{c.emoji}</span>
                    <span className="text-sm font-bold text-gray-900">{c.label}</span>
                    {items.length > 0 && (
                      <span className="text-xs font-semibold text-white rounded-full px-2 py-0.5" style={{ background: FB }}>
                        {items.length}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: FB }}>
                    See all <ChevronRight size={14} />
                  </span>
                </button>
                <div className="mt-2 space-y-2">
                  <NotifList category={c.id} items={top} actions={n} acting={n.acting} navigate={navigate} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}