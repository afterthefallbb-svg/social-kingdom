import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Eye, UserPlus, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

const tiles = (stats) => [
  { key: "users", icon: Users, label: "People on the app", value: stats?.total_users, sub: `+${stats?.new_users_week ?? 0} this week` },
  { key: "new", icon: UserPlus, label: "New this month", value: stats?.new_users_month, sub: `+${stats?.new_users_week ?? 0} in 7 days` },
  { key: "views", icon: Eye, label: "App visitors", value: stats?.visitors, sub: `${stats?.total_views ?? 0} total views` },
];

// Creator-only strip: growth of the community, never any personal details.
export default function CreatorStats({ me }) {
  const [stats, setStats] = useState(null);
  const isCreator = me?.role === "admin";

  useEffect(() => {
    if (!isCreator) return;
    let active = true;
    base44.functions
      .invoke("getCreatorStats", {})
      .then((res) => active && setStats(res.data))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isCreator]);

  if (!isCreator) return null;

  return (
    <section className="sk-creator" aria-label="Creator stats">
      <div className="sk-creator-head">
        <span>Community</span>
        <Link to="/viewers" className="sk-creator-link">
          Viewers <ChevronRight />
        </Link>
      </div>
      <div className="sk-creator-tiles">
        {tiles(stats).map(({ key, icon: Icon, label, value, sub }) => (
          <div key={key} className="sk-creator-tile">
            <Icon />
            <strong>{value ?? "–"}</strong>
            <span>{label}</span>
            <em>{sub}</em>
          </div>
        ))}
      </div>
    </section>
  );
}