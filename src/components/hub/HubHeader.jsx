import React from "react";
import { Link } from "react-router-dom";
import { Eye, UserRound, Users } from "lucide-react";
import { Image } from "@/components/ui/sk-image";
import HubMenu from "@/components/hub/HubMenu";
import KingdomBrand from "@/components/hub/KingdomBrand";
import { SK_LOGO } from "@/lib/brand";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function HubHeader({ me }) {
  return (
    <header className="kingdom-header">
      <div className="kingdom-skyline" aria-hidden="true">
        <Image src="https://media.base44.com/images/public/6ac40db708d83e8619ab9efd/347f80081_generated_image.png" alt="" className="kingdom-skyline-image" focalPointX={0.5} focalPointY={1} quality={100} loading="eager" />
      </div>
      <Link to={me ? "/profile" : "/login?returnTo=" + encodeURIComponent("/profile")} className="kingdom-profile" data-tour="profile-link" aria-label={me ? "My Profile" : "Log in"}>
        <span className={`kingdom-avatar${me && !me.avatar_url ? " kingdom-avatar-new" : ""}`}>
          <span className="kingdom-avatar-image">
            <Image src={me?.avatar_url || SK_LOGO} alt="" className="h-full w-full" fittingType="fill" />
          </span>
        </span>
        <span className={`kingdom-profile-name${me && !me.avatar_url ? " is-reminder" : ""}`}>
          <span>{me ? (me.avatar_url ? me.full_name || "My Profile" : "Add a photo") : "Log In"}</span>
          {me && <VerifiedBadge user={me} compact className="ml-1" />}
        </span>
      </Link>
      <KingdomBrand />
      <div className="kingdom-header-actions">
        {me?.role === "admin" && (
          <Link to="/viewers" className="kingdom-menu-toggle sk-viewers-toggle" aria-label="Viewers">
            <Eye />
          </Link>
        )}
        <Link
          to={me ? "/profile" : "/login?returnTo=" + encodeURIComponent("/profile")}
          className="kingdom-menu-toggle kingdom-view-profile"
          aria-label="View my profile"
          data-tour="view-profile"
        >
          <UserRound />
          <span>Profile</span>
        </Link>
        <HubMenu me={me} buttonClassName="kingdom-menu-toggle" />
        <Link to="/clicks/create" className="kingdom-create-cliq"><Users /><span>CliQ +</span></Link>
      </div>
    </header>
  );
}