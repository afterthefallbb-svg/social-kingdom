import React from "react";
import { BadgeCheck } from "lucide-react";
import useVerified from "@/hooks/useVerified";
import { isVerifiedUser } from "@/lib/verified";

/* The little "Verified" seal that follows a person's name everywhere in the
   app — profile, hub, events, videos, posts, comments and messages. */
export default function VerifiedBadge({ user, id, name, compact = false, className = "" }) {
  const snapshot = useVerified();
  const person = { id: id || user?.id, name: name || user?.full_name };
  const verified = user?.selfie_verified === true || isVerifiedUser(snapshot, person);
  if (!verified) return null;

  if (compact) {
    return (
      <BadgeCheck
        size={13}
        title="Verified"
        aria-label="Verified"
        className={`inline-block shrink-0 align-[-2px] ${className || "text-[#1877f2]"}`}
      />
    );
  }

  return (
    <span
      title="Verified"
      className={`inline-flex items-center gap-1 rounded-full bg-[#e7f0fe] px-1.5 py-[1px] text-[10px] font-bold leading-tight text-[#1877f2] ${className}`}
    >
      <BadgeCheck size={12} aria-hidden="true" />
      Verified
    </span>
  );
}