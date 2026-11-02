import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, MessageCircle, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { addFriendToMyPersonalEvents } from "@/lib/eventVisibility";
import { canContact } from "@/lib/ageSafety";
import { getUser } from "@/lib/users";

const FB = "#1877f2";

// none | outgoing (you asked them) | incoming (they asked you) | friends
export default function FriendMessageActions({ targetId, friendName, friendAvatar }) {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [target, setTarget] = useState(null);
  const [link, setLink] = useState({ status: "none", row: null });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = await base44.auth.me().catch(() => null);
      if (!active || !current || !targetId) return;
      setMe(current);
      const tgt = (await getUser(targetId)) || { id: targetId, full_name: friendName, avatar_url: friendAvatar };
      if (active) setTarget(tgt);

      const outgoing = await base44.entities.Friendship.filter(
        { user_id: current.id, friend_id: targetId },
        { limit: 5 }
      ).catch(() => ({ items: [] }));
      const incoming = await base44.entities.Friendship.filter(
        { user_id: targetId, friend_id: current.id },
        { limit: 5 }
      ).catch(() => ({ items: [] }));
      if (!active) return;

      const accepted = [...outgoing.items, ...incoming.items].find((f) => f.status === "accepted");
      const mine = outgoing.items.find((f) => f.status === "pending");
      const theirs = incoming.items.find((f) => f.status === "pending");
      if (accepted) setLink({ status: "friends", row: accepted });
      else if (theirs) setLink({ status: "incoming", row: theirs });
      else if (mine) setLink({ status: "outgoing", row: mine });
      else setLink({ status: "none", row: null });
    })();
    return () => {
      active = false;
    };
  }, [targetId]);

  const guard = me ? canContact(me, target) : { allowed: true };

  async function requestFriend() {
    if (!me || busy || link.status !== "none") return;
    if (!guard.allowed) {
      toast({ title: "Action blocked", description: guard.reason });
      return;
    }
    setBusy(true);
    try {
      const row = await base44.entities.Friendship.create({
        user_id: me.id,
        friend_id: targetId,
        friend_name: me.full_name || me.email || "",
        friend_avatar: me.avatar_url || "",
        friend_city: me.location || "",
        friend_bio: me.bio || "",
        status: "pending",
      });
      setLink({ status: "outgoing", row });
      toast({ title: "Friend request sent", description: "They'll accept it from their notifications." });
    } catch (e) {
      toast({ title: "Could not send request", description: String(e.message || e) });
    } finally {
      setBusy(false);
    }
  }

  async function acceptRequest() {
    if (!me || busy || link.status !== "incoming" || !link.row) return;
    setBusy(true);
    try {
      await base44.entities.Friendship.update(link.row.id, { status: "accepted" });
      const existing = await base44.entities.Friendship.filter(
        { user_id: me.id, friend_id: targetId },
        { limit: 5 }
      ).catch(() => ({ items: [] }));
      if (!existing.items?.length) {
        await base44.entities.Friendship.create({
          user_id: me.id,
          friend_id: targetId,
          friend_name: link.row.friend_name || "",
          friend_avatar: link.row.friend_avatar || "",
          friend_city: link.row.friend_city || "",
          status: "accepted",
        });
      }
      addFriendToMyPersonalEvents(me.id, targetId);
      setLink({ status: "friends", row: link.row });
      toast({ title: "You are now friends" });
    } catch (e) {
      toast({ title: "Could not accept", description: String(e.message || e) });
    } finally {
      setBusy(false);
    }
  }

  const label =
    link.status === "friends"
      ? "Friends 👑"
      : link.status === "outgoing"
        ? "Request Sent"
        : link.status === "incoming"
          ? "Accept Request"
          : "Add Friend";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={link.status === "incoming" ? acceptRequest : requestFriend}
        disabled={busy || link.status === "friends" || link.status === "outgoing"}
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold"
        style={
          link.status === "friends"
            ? { background: FB, color: "#fff" }
            : link.status === "outgoing"
              ? { background: "#e5e7eb", color: "#6b7280" }
              : link.status === "incoming"
                ? { background: FB, color: "#fff" }
                : { borderColor: FB, color: FB, background: "#fff", borderWidth: 1, borderStyle: "solid" }
        }
      >
        {link.status === "friends" ? null : link.status === "incoming" ? <Check size={15} /> : <UserPlus size={15} />}
        {label}
      </button>
      <button
        type="button"
        onClick={() => {
          if (!guard.allowed) {
            toast({ title: "Action blocked", description: guard.reason });
            return;
          }
          navigate(`/messages?chat=${targetId}`);
        }}
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white"
        style={{ background: FB }}
      >
        <MessageCircle size={15} /> Message
      </button>
    </div>
  );
}