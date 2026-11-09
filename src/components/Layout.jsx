import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useGuest from "@/hooks/useGuest";
import { trackAppView, notePath } from "@/lib/viewTracking";
import BottomNav from "@/components/BottomNav";
import AreaSeeder from "@/components/onboarding/AreaSeeder";
import KingdomBackdrop from "@/components/theme/KingdomBackdrop";
import ScreenTransition from "@/components/mobile/ScreenTransition";
import GuidedTour from "@/components/tour/GuidedTour";
import { useBackdrop } from "@/context/BackdropContext";
import "@/components/theme/white-backdrop.css";

export default function Layout() {
  const { pathname } = useLocation();
  const { checking, guest } = useGuest();
  const { mode } = useBackdrop();

  /* The owner's backdrop switch: white puts a plain shell behind every screen.
     The events map always keeps its own chrome. */
  const white = mode === "white" && pathname !== "/map" && pathname !== "/";

  useEffect(() => {
    document.documentElement.classList.toggle("sk-white", white);
    return () => document.documentElement.classList.remove("sk-white");
  }, [white]);

  // Count each visitor once per session for the creator's viewers numbers.
  useEffect(() => {
    trackAppView();
  }, []);

  // Keep the visitor's current screen up to date so their exit page is known.
  useEffect(() => {
    notePath(pathname);
  }, [pathname]);

  /* Someone without an account can look at the hub and the example map. Every
     other service in the app sends them to sign up. */
  if (!checking && guest && pathname !== "/" && pathname !== "/map") {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className={white ? "relative min-h-screen bg-white" : "sk-theme relative min-h-screen"}>
      {!white && <KingdomBackdrop />}
      <div className={white ? "relative z-10" : "relative z-10"}>
        {pathname === "/map" || pathname === "/" ? (
          <Outlet />
        ) : (
          <ScreenTransition routeKey={pathname}>
            <Outlet />
          </ScreenTransition>
        )}
      </div>
      <BottomNav />
      <AreaSeeder />
      <GuidedTour />
    </div>
  );
}