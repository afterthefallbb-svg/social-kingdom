import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export function useNotifications() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [friends, setFriends] = useState([]);
  const [events, setEvents] = useState([]);
  const [cliqs, setCliqs] = useState([]);
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
          setFriends(fr.items);
          setEvents(ev.items);
          setCliqs(cq.items);
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

  const acceptFriend = async (r) => {
    setActing(r.id);
    try {
      await base44.entities.Friendship.update(r.id, { status: "accepted" });
      setFriends((x) => x.filter((i) => i.id !== r.id));
      toast({ title: "Friend request accepted" });
    } catch {
      toast({ title: "Could not accept", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };
  const denyFriend = async (r) => {
    setActing(r.id);
    try {
      await base44.entities.Friendship.delete(r.id);
      setFriends((x) => x.filter((i) => i.id !== r.id));
      toast({ title: "Request removed" });
    } catch {
      toast({ title: "Could not remove", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };
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
      setEvents((x) => x.filter((i) => i.id !== inv.id));
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
      setEvents((x) => x.filter((i) => i.id !== inv.id));
      toast({ title: "Invite declined" });
    } catch {
      toast({ title: "Could not decline", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };
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
      setCliqs((x) => x.filter((i) => i.id !== inv.id));
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
      setCliqs((x) => x.filter((i) => i.id !== inv.id));
      toast({ title: "Invite declined" });
    } catch {
      toast({ title: "Could not decline", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  return {
    me,
    loading,
    acting,
    friends,
    events,
    cliqs,
    acceptFriend,
    denyFriend,
    attendEvent,
    rejectEvent,
    joinCliq,
    rejectCliq
  };
}