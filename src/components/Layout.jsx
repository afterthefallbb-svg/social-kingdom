import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useGuest from "@/hooks/useGuest";
import { trackAppView } from "@/lib/viewTracking";
import BottomNav from "@/components/BottomNav";
import SelfieGate from "@/components/onboarding/SelfieGate";
import KingdomBackdrop from "@/components/theme/KingdomBackdrop";
import ScreenTransition from "@/components/mobile/ScreenTransition";
import GuidedTour from "@/components/tour/GuidedTour";

export default function Layout() {
  const { pathname } = useLocation();
  // The hub is the landing page now, so every screen sits on the kingdom theme.
  const themed = true;
  const { checking, guest } = useGuest();

  // Count each visitor once per session for the creator's viewers numbers.
  useEffect(() => {
    trackAppView();
  }, []);

  /* Someone without an account can look at the hub and the example map. Every
     other service in the app sends them to sign up. */
  if (!checking && guest && pathname !== "/" && pathname !== "/map") {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className={themed ? "sk-theme relative min-h-screen" : "relative min-h-screen bg-white"}>
      {themed && <KingdomBackdrop />}
      <div className={themed ? "relative z-10" : undefined}>
        <ScreenTransition routeKey={pathname}>
          <Outlet />
        </ScreenTransition>
      </div>
      <BottomNav />
      <SelfieGate />
      <GuidedTour />
    </div>
  );
}