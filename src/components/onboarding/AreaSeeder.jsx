import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { seedLocalEventsForUser } from "@/lib/localSeed";

/* Silent: fills a brand-new account's area with a few nearby gatherings so the
   map is never empty. Nothing is shown and nothing is required. */
export default function AreaSeeder() {
  useEffect(() => {
    let alive = true;
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!alive || !user) return;

      // Only after the person chose to share their location on the map: nothing
      // may ask the browser for it on page load.
      if (localStorage.getItem("sk:location_granted") !== "1") return;

      const seedKey = `seed_run_v3_${user.id}`;
      if (sessionStorage.getItem(seedKey)) return;
      sessionStorage.setItem(seedKey, "1");
      if (user.sk_onboarded) return;
      const res = await seedLocalEventsForUser();
      if (alive && res?.seeded) {
        window.dispatchEvent(new CustomEvent("sk:area_seeded", { detail: { firstInArea: true } }));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return null;
}