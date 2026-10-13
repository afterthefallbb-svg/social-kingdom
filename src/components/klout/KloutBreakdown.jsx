import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { X } from "lucide-react";

const REACTIONS = [
  { id: "thumbs", emoji: "👍", label: "Likes" },
  { id: "horns", emoji: "🤘", label: "Rock on" },
  { id: "crown", emoji: "👑", label: "Crowns" },
];

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

  return (
    <div className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5">👑 Klout</h3>
            <p className="text-xs text-gray-400">
              {total} total from {voters.length} {voters.length === 1 ? "person" : "people"}
            </p>
          </div>
          <button onClick={onClose} className="p-1" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-around py-3 border-b">
          {REACTIONS.map((r) => (
            <div key={r.id} className="text-center">
              <div className="text-2xl">{r.emoji}</div>
              <div className="text-lg font-bold text-gray-900">{counts[r.id] || 0}</div>
              <div className="text-[11px] text-gray-400">{r.label}</div>
            </div>
          ))}
        </div>

        <div className="overflow-y-auto p-3 space-y-1">
          {loading && <p className="text-sm text-gray-400 text-center py-4">Loading…</p>}
          {!loading && voters.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No Klout yet. Be the first to give some!</p>
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
              <span className="text-lg">{REACTIONS.find((r) => r.id === v.reaction)?.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}