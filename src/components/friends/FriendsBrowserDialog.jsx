import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "@/components/ui/sk-image";
import { base44 } from "@/api/base44Client";
import { NEON } from "@/lib/neonControls";

// Scrollable, searchable list of the signed-in user's accepted friends,
// opened from the hub's Friends toggle.
export default function FriendsBrowserDialog({ open, onClose, me }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open || !me?.id) return;
    let active = true;
    setLoading(true);
    base44.entities.Friendship
      .filter({ user_id: me.id, status: "accepted" }, { limit: 200 })
      .then((res) => { if (active) setFriends(res.items || []); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, me?.id]);

  const q = query.trim().toLowerCase();
  const shown = q
    ? friends.filter((f) =>
        (f.friend_name || "").toLowerCase().includes(q) ||
        (f.friend_city || "").toLowerCase().includes(q))
    : friends;

  const openProfile = (id) => {
    onClose();
    navigate(`/profile/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-0 p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3" style={{ background: NEON.soft }}>
          <DialogTitle className="text-base font-bold text-gray-900">Friends</DialogTitle>
          <div className="mt-2 flex items-center rounded-full px-3 h-10 border" style={NEON.field}>
            <Search size={16} className="shrink-0" style={{ color: NEON.text }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your friends"
              className="ml-2 flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-3 py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin" style={{ color: NEON.solid }} />
            </div>
          ) : shown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              {friends.length === 0 ? "No friends yet." : "No friends match that search."}
            </p>
          ) : (
            shown.map((f) => (
              <button
                key={f.id}
                onClick={() => openProfile(f.friend_id)}
                className="w-full flex items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[#eef6ff]"
              >
                <span
                  className="w-11 h-11 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold border-2"
                  style={{ borderColor: NEON.border, background: NEON.soft, color: NEON.text }}
                >
                  {f.friend_avatar
                    ? <Image src={f.friend_avatar} fittingType="fill" className="w-full h-full" />
                    : (f.friend_name || "?").charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 truncate">{f.friend_name}</span>
                  {f.friend_city && (
                    <span className="block text-xs text-gray-500 truncate">{f.friend_city}</span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}