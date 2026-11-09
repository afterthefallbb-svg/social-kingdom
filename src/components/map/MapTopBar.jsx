import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/sk-image";
import { SK_LOGO } from "@/lib/brand";
import VerifiedBadge from "@/components/VerifiedBadge";
import HubMenu from "@/components/hub/HubMenu";
import HubIconRow from "@/components/hub/HubIconRow";
import SignUpBar from "@/components/hub/SignUpBar";
import SignUpSheet from "@/components/auth/SignUpSheet";
import "@/components/hub/kingdom.css";
import "@/components/hub/kingdom-materials.css";
import "@/components/map/map-topbar.css";

/* Everything above the map search is the hub's own top bar — same avatar,
   name, verified mark, menu, create button and swipeable icon row — so the
   two main screens read as one app. The map stays visible behind it. */
export default function MapTopBar() {
  const [me, setMe] = useState(undefined);
  const [join, setJoin] = useState(null);

  useEffect(() => {
    let active = true;
    base44.auth
      .me()
      .then((u) => active && setMe(u))
      .catch(() => active && setMe(null));
    return () => {
      active = false;
    };
  }, []);

  const loaded = me !== undefined;
  const signedIn = loaded && !!me;
  const profileTo = signedIn ? "/profile" : "/login?returnTo=" + encodeURIComponent("/profile");

  return (
    <header className="sk-map-top">
      <div className="sk-map-top-row">
        <Link to={profileTo} className="sk-map-user" aria-label={signedIn ? "My Profile" : "Log in"}>
          <span className="sk-map-user-avatar">
            <Image src={me?.avatar_url || SK_LOGO} alt="" className="h-full w-full" fittingType="fill" />
          </span>
          <span className="sk-map-user-name">
            <span>{signedIn ? me.full_name || "My Profile" : "Log In"}</span>
            {signedIn && <VerifiedBadge user={me} compact />}
          </span>
        </Link>
        <div className="sk-map-actions">
          <button
            type="button"
            className="sk-map-help"
            aria-label="How Social Kingdom works"
            onClick={() => window.dispatchEvent(new Event("sk:start_tour"))}
          >
            ?
          </button>
          <HubMenu me={me || null} buttonClassName="sk-map-menu" />
          {signedIn ? (
            <Link to="/clicks/create" className="sk-map-cliq">
              <Users />
              <span>CliQ +</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setJoin("Start a CliQ and invite people near you")}
              className="sk-map-cliq"
            >
              <Users />
              <span>CliQ +</span>
            </button>
          )}
        </div>
      </div>

      <SignUpBar />

      <div className="sk-map-icons">
        <HubIconRow me={me || null} />
      </div>

      <SignUpSheet open={!!join} intent={join} onClose={() => setJoin(null)} />
    </header>
  );
}