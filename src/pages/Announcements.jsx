import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Megaphone, Pin } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FB = "#1877f2";

const CATEGORY_STYLE = {
  launch: { label: "Launch", bg: "#dcfce7", color: "#15803d" },
  update: { label: "Update", bg: "#dbeafe", color: "#1d4ed8" },
  maintenance: { label: "Maintenance", bg: "#fef9c3", color: "#a16207" },
  general: { label: "General", bg: "#f1f5f9", color: "#475569" },
};

export default function Announcements() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await base44.entities.Announcement.filter(
          {},
          { sort: "-created_date", limit: 100 }
        );
        if (!active) return;
        const list = res.items || [];
        // Pinned first, then newest
        list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        setItems(list);
      } catch {
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <button onClick={() => navigate(-1)} aria-label="Back" className="p-1">
          <ChevronLeft size={24} color="#fff" />
        </button>
        <h1 className="text-xl font-bold">Announcements</h1>
      </div>

      <div className="max-w-2xl mx-auto px-3 pt-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Megaphone size={28} className="mx-auto mb-2 text-gray-300" />
            No announcements right now. Check back soon.
          </div>
        )}
        {items.map((a) => {
          const cat = CATEGORY_STYLE[a.category] || CATEGORY_STYLE.general;
          return (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-2 flex-wrap">
                {a.pinned && <Pin size={14} className="text-gray-400" fill="#9ca3af" />}
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  {cat.label}
                </span>
                <span className="text-[11px] text-gray-400 ml-auto">
                  {a.created_date ? new Date(a.created_date).toLocaleDateString() : ""}
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 mt-2">{a.title}</h2>
              <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{a.body}</p>
              {a.author_name && <p className="text-[11px] text-gray-400 mt-2">— {a.author_name}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}