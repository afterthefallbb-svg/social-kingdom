import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { seedLocalEventsForUser } from "@/lib/localSeed";

const FB = "#1877f2";

export default function WelcomePopup() {
  const [me, setMe] = useState(null);
  const [show, setShow] = useState(false);
  const [firstInArea, setFirstInArea] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!active || !u) return;
      setMe(u);
      const seenKey = `welcome_seen_${u.id}`;
      if (!localStorage.getItem(seenKey)) setShow(true);

      // Seed local placeholder events once per browser session.
      const seedKey = `seed_run_${u.id}`;
      if (!sessionStorage.getItem(seedKey)) {
        sessionStorage.setItem(seedKey, "1");
        const res = await seedLocalEventsForUser();
        if (active && res?.firstInArea) {
          setFirstInArea(true);
          window.dispatchEvent(new CustomEvent("sk:area_seeded", { detail: { firstInArea: true } }));
        }
      }
    })();
    return () => { active = false; };
  }, []);

  function dismiss() {
    if (me) localStorage.setItem(`welcome_seen_${me.id}`, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[700] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full flex flex-col overflow-hidden" style={{ maxHeight: "86vh" }}>
        <div className="px-6 pt-6 pb-2 text-center">
          <h2 className="text-xl font-bold text-gray-900">Welcome to Social Kingdom 👋</h2>
        </div>
        <div className="px-6 pb-4 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-3">
          {firstInArea && (
            <p>
              We have generated five Public Events, Activities, Get-togethers, and Parties in your
              area to help you see how this app works. These events are real, so be sure to invite
              your friends and family to come download the app and create profiles so that they can
              start attending events and parties along with you and the rest of us, or host your own!
            </p>
          )}
          <p>
            The more people that are on the Social Kingdom app or website, the more successfully it
            works! We are marketing to get people out there on this app as quickly as we can, but we
            could sure use all the help we can get!
          </p>
          <p>
            The main feature for Social Kingdom is the ability to meet people physically by attending
            or creating any type of party, event, activity, or get-together with the maps feature.
          </p>
          <p>
            Our design is tailored for you to have whatever you need at your disposal on ONE social
            media app. Every profile is connected to a real person, so on Social Kingdom someone can
            build real meaning, quality of life, real friendships, and real relationships!
          </p>
          <p className="font-semibold text-gray-900">
            We challenge you to help us change the social media industry, and to change the world!
          </p>
        </div>
        <div className="px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
          <button
            onClick={dismiss}
            className="w-full rounded-xl py-3.5 text-base font-bold text-white shadow-md"
            style={{ background: FB }}
          >
            Thank You
          </button>
        </div>
      </div>
    </div>
  );
}