import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { X } from "lucide-react";

const REACTIONS = [
  { id: "thumbs", emoji: "👍", label: "Like" },
  { id: "horns", emoji: "🤘", label: "Super like" },
  { id: "crown", emoji: "👑", label: "Crown" },
];
const reactionEmoji = (rid) => (REACTIONS.find((r) => r.id === rid) || {}).emoji || "👍";

export default function KloutBreakdown({ target_type, target_id, counts, total, onClose }) {
  const navigate = useNavigate();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await base44.entities.Klout.filter(
        { target_id, target_type },
        { sort: "-value", limit: 100 }
      ).catch(() => ({ items: [] }));
      if (active) {
        setVoters(res.items);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [target_id, target_type]);

  const listTitle = target_type === "profile" ? "People who like me" : "People who like us";

  return (
    <div className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="inline-flex items-center gap-1.5 text-lg font-bold text-gray-900">
            <span>{total}</span>
            <span>👑</span>
          </div>
          <button onClick={onClose} className="p-1" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Stacked reaction counts — top of the page, going downwards */}
        <div className="px-4 py-3 space-y-2 border-b">
          {REACTIONS.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <span className="text-xl w-7 text-center">{r.emoji}</span>
              <span className="text-lg font-bold text-gray-900 w-8">{counts[r.id] || 0}</span>
              <span className="text-sm text-gray-500">{r.label}</span>
            </div>
          ))}
        </div>

        <div className="px-4 pt-3 pb-1">
          <h4 className="text-sm font-bold text-gray-900">{listTitle}</h4>
        </div>

        <div className="overflow-y-auto px-2 pb-3 space-y-1">
          {loading && <p className="text-sm text-gray-400 text-center py-4">Loading…</p>}
          {!loading && voters.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No reactions yet. Be the first!</p>
          )}
          {voters.map((v) => (
            <button
              key={v.id}
              onClick={() => v.user_id && navigate(`/profile/${v.user_id}`)}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 text-left"
            >
              <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                {v.user_avatar ? (
                  <Image src={v.user_avatar} fittingType="fill" className="w-full h-full" />
                ) : (
                  (v.user_name || "?").charAt(0)
                )}
              </span>
              <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                {v.user_name || "Someone"}
              </span>
              <span className="text-lg">{reactionEmoji(v.reaction)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}