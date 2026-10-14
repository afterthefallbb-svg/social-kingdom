import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const FB = "#1877f2";

export default function FriendMessageActions({ targetId, friendName, friendAvatar }) {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = await base44.auth.me().catch(() => null);
      if (!active || !current || !targetId) return;
      setMe(current);
      const res = await base44.entities.Friendship.filter(
        { user_id: current.id, friend_id: targetId },
        { limit: 1 }
      ).catch(() => ({ items: [] }));
      if (active) setIsFriend(!!res.items?.length);
    })();
    return () => {
      active = false;
    };
  }, [targetId]);

  async function addFriend() {
    if (!me || busy || isFriend) return;
    setBusy(true);
    try {
      await base44.entities.Friendship.create({
        user_id: me.id,
        friend_id: targetId,
        friend_name: friendName || "",
        friend_avatar: friendAvatar || "",
        status: "accepted",
      });
      setIsFriend(true);
      toast({ title: "You are now friends" });
    } catch (e) {
      toast({ title: "Could not add friend", description: String(e.message || e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={addFriend}
        disabled={busy || isFriend}
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold"
        style={
          isFriend
            ? { background: FB, color: "#fff" }
            : { borderColor: FB, color: FB, background: "#fff", borderWidth: 1, borderStyle: "solid" }
        }
      >
        {isFriend ? (
          <>Friends 👑</>
        ) : (
          <>
            <UserPlus size={15} /> Add Friend
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => navigate("/messages")}
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white"
        style={{ background: FB }}
      >
        <MessageCircle size={15} /> Message
      </button>
    </div>
  );
}