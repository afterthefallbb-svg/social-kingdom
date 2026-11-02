import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileCardRow from "@/components/profile/ProfileCardRow";
import ClickPresenceBadge from "@/components/presence/ClickPresenceBadge";
import { useClickHosts } from "@/hooks/useClickHosts";

export default function CliQsSection({ clicks }) {
  const navigate = useNavigate();
  const hosts = useClickHosts(clicks);

  const items = clicks.map((c) => ({
    id: c.id,
    label: c.name,
    image: c.avatar_url,
    emoji: "👥",
    meta: `${(c.member_count || 0).toLocaleString()} members`,
    onClick: () => navigate(`/clicks/${c.id}`),
    click: c
  }));

  return (
    <ProfileCardRow
      title="CliQs"
      badge="👥"
      items={items}
      emptyText="No CliQs joined yet."
      renderOverlay={(item) => (
        <ClickPresenceBadge click={item.click} host={hosts[item.id]} className="-top-1 -right-1 text-xs" />
      )}
    />
  );
}