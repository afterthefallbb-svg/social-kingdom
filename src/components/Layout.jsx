import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { trackAppView } from "@/lib/viewTracking";
import BottomNav from "@/components/BottomNav";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import KingdomBackdrop from "@/components/theme/KingdomBackdrop";

export default function Layout() {
  const { pathname } = useLocation();
  const themed = pathname !== "/";

  // Count each visitor once per session for the creator's viewers numbers.
  useEffect(() => {
    trackAppView();
  }, []);

  return (
    <div className={themed ? "sk-theme relative min-h-screen" : "relative min-h-screen bg-white"}>
      {themed && <KingdomBackdrop />}
      <div className={themed ? "relative z-10" : undefined}>
        <Outlet />
      </div>
      <BottomNav />
      <OnboardingFlow />
    </div>
  );
}