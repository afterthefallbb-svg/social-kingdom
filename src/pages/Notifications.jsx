import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import { getCategory } from "@/lib/categories";

const FB = "#1877f2";

const TABS = [
  { id: "friends", label: "Friend Requests", emoji: "👤" },
  { id: "events", label: "Event Invites", emoji: "📅" },
  { id: "cliqs", label: "CliQ Requests", emoji: "👥" },
  { id: "klout", label: "Klout", emoji: "👑" }
];

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("friends");
  const [friendReqs, setFriendReqs] = useState([]);
  const [eventInvites, setEventInvites] = useState([]);
  const [cliqInvites, setCliqInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!active || !u) return;
      setMe(u);
      try {
        const fr = await base44.entities.Friendship.filter(
          { friend_id: u.id, status: "pending" },
          { sort: "-created_date", limit: 100 }
        );
        const ev = await base44.entities.Invite.filter(
          { invitee_id: u.id, target_type: "event", status: "pending" },
          { sort: "-created_date", limit: 100 }
        ).catch(() => ({ items: [] }));
        const cq = await base44.entities.Invite.filter(
          { invitee_id: u.id, target_type: "click", status: "pending" },
          { sort: "-created_date", limit: 100 }
        ).catch(() => ({ items: [] }));
        if (active) {
          setFriendReqs(fr.items);
          setEventInvites(ev.items);
          setCliqInvites(cq.items);
        }
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

  // Friend requests
  const acceptFriend = async (req) => {
    setActing(req.id);
    try {
      await base44.entities.Friendship.update(req.id, { status: "accepted" });
      setFriendReqs((r) => r.filter((x) => x.id !== req.id));
      toast({ title: "Friend request accepted" });
    } catch {
      toast({ title: "Could not accept", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };
  const denyFriend = async (req) => {
    setActing(req.id);
    try {
      await base44.entities.Friendship.delete(req.id);
      setFriendReqs((r) => r.filter((x) => x.id !== req.id));
      toast({ title: "Request removed" });
    } catch {
      toast({ title: "Could not remove", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  // Event invites
  const attendEvent = async (inv) => {
    setActing(inv.id);
    try {
      await base44.entities.Attendance.create({
        event_id: inv.target_id,
        user_id: me.id,
        user_name: me.full_name || "",
        user_avatar: me.avatar_url || "",
        status: "confirmed"
      }).catch(() => {});
      await base44.entities.Invite.update(inv.id, { status: "accepted" });
      setEventInvites((r) => r.filter((x) => x.id !== inv.id));
      toast({ title: "You're attending!" });
    } catch {
      toast({ title: "Could not accept", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };
  const rejectEvent = async (inv) => {
    setActing(inv.id);
    try {
      await base44.entities.Invite.update(inv.id, { status: "rejected" });
      setEventInvites((r) => r.filter((x) => x.id !== inv.id));
      toast({ title: "Invite declined" });
    } catch {
      toast({ title: "Could not decline", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  // CliQ invites
  const joinCliq = async (inv) => {
    setActing(inv.id);
    try {
      await base44.entities.ClickMembership.create({
        click_id: inv.target_id,
        user_id: me.id,
        user_name: me.full_name || "",
        user_avatar: me.avatar_url || ""
      }).catch(() => {});
      await base44.entities.Invite.update(inv.id, { status: "joined" });
      setCliqInvites((r) => r.filter((x) => x.id !== inv.id));
      toast({ title: "You joined the CliQ!" });
    } catch {
      toast({ title: "Could not join", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };
  const rejectCliq = async (inv) => {
    setActing(inv.id);
    try {
      await base44.entities.Invite.update(inv.id, { status: "rejected" });
      setCliqInvites((r) => r.filter((x) => x.id !== inv.id));
      toast({ title: "Invite declined" });
    } catch {
      toast({ title: "Could not decline", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const initial = (n) => (n ? n.charAt(0).toUpperCase() : "?");

  const ToggleRow = ({ left, onAccept, onDeny, acceptLabel, denyLabel, id }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
      <div className="flex-1 min-w-0">{left}</div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onAccept}
          disabled={acting === id}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: FB }}
        >
          <Check size={14} className="inline -mt-0.5" /> {acceptLabel}
        </button>
        <button
          onClick={onDeny}
          disabled={acting === id}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 disabled:opacity-50"
        >
          <X size={14} className="inline -mt-0.5" /> {denyLabel}
        </button>
      </div>
    </div>
  );

  const Avatar = ({ src, name, cls = "w-11 h-11" }) => (
    <span className={`${cls} rounded-full overflow-hidden flex items-center justify-center text-base font-bold bg-gray-100 shrink-0`}>
      {src ? <Image src={src} fittingType="fill" className="w-full h-full" /> : initial(name)}
    </span>
  );

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Notifications</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <div className="flex gap-2 px-4 mt-4 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium"
              style={{ background: active ? FB : "#eef2f7", color: active ? "#fff" : "#1f2937" }}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-5 space-y-3">
        {loading ? (
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        ) : tab === "friends" ? (
          friendReqs.length === 0 ? (
            <p className="text-sm text-gray-400">No friend requests right now.</p>
          ) : (
            friendReqs.map((r) => (
              <ToggleRow
                key={r.id}
                id={r.id}
                acceptLabel="Accept"
                denyLabel="Deny"
                onAccept={() => acceptFriend(r)}
                onDeny={() => denyFriend(r)}
                left={
                  <button onClick={() => navigate(`/profile/${r.user_id}`)} className="flex items-center gap-3 min-w-0 text-left">
                    <Avatar src={r.friend_avatar} name={r.friend_name} />
                    <span className="min-w-0">
                      <span className="text-sm font-semibold text-gray-900 truncate block">{r.friend_name || "Unknown"}</span>
                      <span className="text-[11px] text-gray-400">wants to be your friend</span>
                    </span>
                  </button>
                }
              />
            ))
          )
        ) : tab === "events" ? (
          eventInvites.length === 0 ? (
            <p className="text-sm text-gray-400">No event invites right now.</p>
          ) : (
            eventInvites.map((inv) => {
              const cat = getCategory(inv.target_category);
              return (
                <ToggleRow
                  key={inv.id}
                  id={inv.id}
                  acceptLabel="Attend"
                  denyLabel="Reject"
                  onAccept={() => attendEvent(inv)}
                  onDeny={() => rejectEvent(inv)}
                  left={
                    <button onClick={() => navigate(`/event/${inv.target_id}`)} className="flex items-center gap-3 min-w-0 text-left">
                      <span className="relative shrink-0">
                        <span className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-2xl bg-gray-100">
                          {inv.target_image ? (
                            <Image src={inv.target_image} fittingType="fill" className="w-full h-full" />
                          ) : (
                            cat.emoji
                          )}
                        </span>
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs shadow-sm">
                          {cat.emoji}
                        </span>
                      </span>
                      <span className="min-w-0">
                        <span className="text-sm font-semibold text-gray-900 truncate block">{inv.target_name}</span>
                        <span className="text-[11px] text-gray-400 truncate block">{inv.target_address || "Location"}</span>
                        <span className="text-[10px] text-gray-400">from {inv.inviter_name || "someone"}</span>
                      </span>
                    </button>
                  }
                />
              );
            })
          )
        ) : tab === "cliqs" ? (
          cliqInvites.length === 0 ? (
            <p className="text-sm text-gray-400">No CliQ invitations right now.</p>
          ) : (
            cliqInvites.map((inv) => (
              <ToggleRow
                key={inv.id}
                id={inv.id}
                acceptLabel="Join"
                denyLabel="Reject"
                onAccept={() => joinCliq(inv)}
                onDeny={() => rejectCliq(inv)}
                left={
                  <button onClick={() => navigate(`/clicks/${inv.target_id}`)} className="flex items-center gap-3 min-w-0 text-left">
                    <Avatar src={inv.target_image} name={inv.target_name} />
                    <span className="min-w-0">
                      <span className="text-sm font-semibold text-gray-900 truncate block">{inv.target_name}</span>
                      <span className="text-[11px] text-gray-400">invited you to join this CliQ</span>
                    </span>
                  </button>
                }
              />
            ))
          )
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-lg">👑</span>
            <span>No new Klout notifications yet.</span>
          </div>
        )}
      </div>
    </div>
  );
}