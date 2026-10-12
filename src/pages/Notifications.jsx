import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";

const FB = "#1877f2";

// Notification categories, swipeable right-to-left (rendered left to right).
const TABS = [
  { id: "events", label: "Events Requests", emoji: "📅" },
  { id: "friends", label: "Friend Requests", emoji: "👤" },
  { id: "cliqs", label: "CliQ Requests", emoji: "👥" },
  { id: "klout", label: "Klout", emoji: "👑" }
];

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("events");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!active || !u) return;
      setMe(u);
      try {
        // Incoming friend requests: someone added me as a pending friend.
        const res = await base44.entities.Friendship.filter(
          { friend_id: u.id, status: "pending" },
          { sort: "-created_date", limit: 100 }
        );
        if (active) setRequests(res.items);
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const accept = async (req) => {
    setActing(req.id);
    try {
      await base44.entities.Friendship.update(req.id, { status: "accepted" });
      setRequests((r) => r.filter((x) => x.id !== req.id));
      toast({ title: "Friend request accepted" });
    } catch (e) {
      toast({ title: "Could not accept", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const deny = async (req) => {
    setActing(req.id);
    try {
      await base44.entities.Friendship.delete(req.id);
      setRequests((r) => r.filter((x) => x.id !== req.id));
      toast({ title: "Request removed" });
    } catch (e) {
      toast({ title: "Could not remove", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const initial = (n) => (n ? n.charAt(0).toUpperCase() : "?");

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Notifications</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      {/* Category bubbles — swipeable */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium"
              style={{
                background: active ? FB : "#eef2f7",
                color: active ? "#fff" : "#1f2937"
              }}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-5">
        {tab === "friends" ? (
          loading ? (
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-400">No friend requests right now.</p>
          ) : (
            <div className="space-y-5">
              {/* Quick-scan bubbles */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {requests.map((r) => (
                  <div key={r.id} className="flex flex-col items-center gap-1 shrink-0 w-16">
                    <span className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold bg-gray-100">
                      {r.friend_avatar ? (
                        <Image src={r.friend_avatar} fittingType="fill" className="w-full h-full" />
                      ) : (
                        initial(r.friend_name)
                      )}
                    </span>
                    <span className="text-[10px] text-gray-600 text-center truncate w-full">
                      {(r.friend_name || "Unknown").split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Full list with accept / deny */}
              <div className="space-y-3">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200"
                  >
                    <span className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-base font-bold bg-gray-100 shrink-0">
                      {r.friend_avatar ? (
                        <Image src={r.friend_avatar} fittingType="fill" className="w-full h-full" />
                      ) : (
                        initial(r.friend_name)
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/profile/${r.user_id}`)}
                        className="text-sm font-semibold text-gray-900 truncate block text-left"
                      >
                        {r.friend_name || "Unknown"}
                      </button>
                      <span className="text-[11px] text-gray-400">wants to be your friend</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => accept(r)}
                        disabled={acting === r.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                        style={{ background: FB }}
                      >
                        <Check size={14} className="inline -mt-0.5" /> Accept
                      </button>
                      <button
                        onClick={() => deny(r)}
                        disabled={acting === r.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 disabled:opacity-50"
                      >
                        <X size={14} className="inline -mt-0.5" /> Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : tab === "events" ? (
          <p className="text-sm text-gray-400">No event requests yet.</p>
        ) : tab === "cliqs" ? (
          <p className="text-sm text-gray-400">No CliQ invitations yet.</p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex flex-col items-center leading-none">
              <span className="text-[10px] -mb-0.5">👑</span>
              <span className="font-extrabold">K</span>
            </span>
            <span>No new Klout notifications yet.</span>
          </div>
        )}
      </div>
    </div>
  );
}