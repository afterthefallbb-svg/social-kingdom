import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import ClickPresenceBadge from "@/components/presence/ClickPresenceBadge";
import { useClickHosts } from "@/hooks/useClickHosts";

const FB = "#1877f2";

export default function Clicks() {
  const [clicks, setClicks] = useState([]);
  const hosts = useClickHosts(clicks);

  useEffect(() => {
    base44.entities.Click
      .filter({}, { limit: 50 })
      .then((page) => setClicks(page.items))
      .catch(() => setClicks([]));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <Link to="/profile" aria-label="Back">
          <ArrowLeft size={22} color="#000000" />
        </Link>
        <h1 className="text-xl font-bold">CliQ's</h1>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-500">Your personal groups of friends. Host events, share moments, and stay connected.</p>
        {clicks.length === 0 && <p className="text-sm text-gray-400">No CliQ's yet.</p>}
        {clicks.map((c) => (
          <Link
            key={c.id}
            to={`/clicks/${c.id}`}
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-3 shadow-sm"
          >
            <div className="relative w-16 h-16 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: FB }}>
                {c.avatar_url ? (
                  <Image src={c.avatar_url} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color: FB }}>
                    {(c.name || "?").charAt(0)}
                  </div>
                )}
              </div>
              <ClickPresenceBadge click={c} host={hosts[c.id]} className="-top-1 -right-1 text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-900 truncate">{c.name}</h2>
              {c.description && <p className="text-sm text-gray-500 truncate">{c.description}</p>}
              <p className="text-xs font-semibold mt-1 flex items-center gap-1" style={{ color: FB }}>
                <Users size={13} /> {c.member_count || 0} members
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}