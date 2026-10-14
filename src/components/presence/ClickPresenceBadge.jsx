import React from "react";
import { clickPresenceBadge } from "@/lib/presence";
import PresenceBadge from "./PresenceBadge";

export default function ClickPresenceBadge({ click, host, className = "" }) {
  const badge = clickPresenceBadge(click, host);
  return <PresenceBadge badge={badge} className={className} />;
}