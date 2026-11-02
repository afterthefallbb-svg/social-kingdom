import React from "react";
import moment from "moment";
import { getCategory } from "@/lib/categories";
import ProfileCardRow from "@/components/profile/ProfileCardRow";

export default function EventsAttendedSection({ events, onSelect }) {
  const items = events.map((e) => ({
    id: e.id,
    label: e.title,
    image: e.image_url,
    emoji: getCategory(e.category).emoji,
    meta: e.start_time ? `Went · ${moment(e.start_time).format("MMM D")}` : "Attended",
    onClick: () => onSelect(e)
  }));

  return (
    <ProfileCardRow title="Events Attended" badge="✓" items={items} emptyText="No past events yet." />
  );
}