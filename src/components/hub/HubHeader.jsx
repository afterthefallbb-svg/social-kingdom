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
        <Image src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/fcd7493e9_kingdom-city-header-full.png" alt="" className="kingdom-skyline-image" quality={100} loading="eager" />
      </div>
      <Link to={me ? "/profile" : "/register"} className="kingdom-profile" data-tour="profile-link" aria-label={me ? "My Profile" : "Sign up or log in"}>
        <span className="kingdom-avatar">
          <span className="kingdom-avatar-image">{me?.avatar_url ? <Image src={me.avatar_url} alt="" className="h-full w-full" /> : <UserRound className="kingdom-avatar-placeholder" />}</span>
          <span className="kingdom-camera" aria-hidden="true"><Camera /></span>
        </span>
        <span className="kingdom-profile-name">{me ? me.full_name || "My Profile" : "Sign Up"}</span>
      </Link>
      <KingdomBrand />
      <div className="kingdom-header-actions">
        <HubMenu me={me} buttonClassName="kingdom-menu-toggle" />
        <Link to="/clicks/create" className="kingdom-create-cliq"><Users /><span>CliQ +</span></Link>
      </div>
    </header>
  );
}