import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ClickPresenceBadge from "@/components/presence/ClickPresenceBadge";
import HubCard from "@/components/hub/HubCard";
import { useClickHosts } from "@/hooks/useClickHosts";

const FB = "#1877f2";

export default function Clicks() {
  const navigate = useNavigate();
  const [clicks, setClicks] = useState([]);
  const hosts = useClickHosts(clicks);

  useEffect(() => {
    base44.entities.Click
      .filter({}, { limit: 50 })
      .then((page) => setClicks(page.items))
      .catch(() => setClicks([]));
  }, []);

  return (
    <div className="min-h-screen pb-32">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <Link to="/profile" aria-label="Back">
          <ArrowLeft size={22} color="#000000" />
        </Link>
        <h1 className="text-xl font-bold">CliQ's</h1>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-500">Your personal groups of friends. Host events, share moments, and stay connected.</p>
        {clicks.length === 0 && <p className="text-sm text-gray-400">No CliQ's yet.</p>}
        {clicks.length > 0 && (
          <div className="kingdom-grid">
            {clicks.map((c) => (
              <div key={c.id} className="relative">
                <HubCard
                  item={{
                    label: c.name,
                    image: c.avatar_url,
                    emoji: "👥",
                    meta: `${(c.member_count || 0).toLocaleString()} members`,
                  }}
                  onClick={() => navigate(`/clicks/${c.id}`)}
                />
                <ClickPresenceBadge click={c} host={hosts[c.id]} className="-top-1 -right-1 text-base" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}