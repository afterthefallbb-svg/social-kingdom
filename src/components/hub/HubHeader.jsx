import React from "react";
import { Link } from "react-router-dom";
import { Camera, UserRound, Users } from "lucide-react";
import { Image } from "@/components/ui/image";
import HubMenu from "@/components/hub/HubMenu";
import KingdomBrand from "@/components/hub/KingdomBrand";

export default function HubHeader({ me }) {
  return (
    <header className="kingdom-header">
      <div className="kingdom-skyline" aria-hidden="true">
        <Image src="https://media.base44.com/images/public/6ac40db708d83e8619ab9efd/347f80081_generated_image.png" alt="" className="kingdom-skyline-image" focalPointX={0.5} focalPointY={1} quality={100} loading="eager" />
      </div>
      <Link to={me ? "/profile" : "/login?returnTo=" + encodeURIComponent("/profile")} className="kingdom-profile" data-tour="profile-link" aria-label={me ? "My Profile" : "Log in"}>
        <span className="kingdom-avatar">
          <span className="kingdom-avatar-image">{me?.avatar_url ? <Image src={me.avatar_url} alt="" className="h-full w-full" /> : <UserRound className="kingdom-avatar-placeholder" />}</span>
          <span className="kingdom-camera" aria-hidden="true"><Camera /></span>
        </span>
        <span className="kingdom-profile-name">{me ? me.full_name || "My Profile" : "Log In"}</span>
      </Link>
      <KingdomBrand />
      <div className="kingdom-header-actions">
        <HubMenu me={me} buttonClassName="kingdom-menu-toggle" />
        <Link to="/clicks/create" className="kingdom-create-cliq"><Users /><span>CliQ +</span></Link>
      </div>
    </header>
  );
}