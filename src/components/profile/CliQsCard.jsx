import React from "react";
import { Link } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

export default function CliQsCard({ clicks = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">CliQ's</h3>
        <Link to="/clicks" className="inline-flex items-center text-sm font-semibold" style={{ color: FB }}>
          All <ChevronRight size={14} />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 mt-2">
        {clicks.length === 0 && (
          <p className="text-sm text-gray-400">You're not in any CliQ's yet.</p>
        )}
        {clicks.map((c) => (
          <Link key={c.id} to={`/clicks/${c.id}`} className="shrink-0 w-24 text-center">
            <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2" style={{ borderColor: FB }}>
              {c.avatar_url ? (
                <Image src={c.avatar_url} fittingType="fill" className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold" style={{ color: FB }}>
                  {(c.name || "?").charAt(0)}
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-800 mt-1.5 truncate">{c.name}</p>
            <p className="text-[11px] text-gray-400 flex items-center justify-center gap-0.5">
              <Users size={10} /> {c.member_count || 0}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}