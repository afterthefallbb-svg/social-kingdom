import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { seedLocalEventsForUser } from "@/lib/localSeed";
import AnnouncementModal from "./AnnouncementModal";
import TourOverlay from "./TourOverlay";
import SelfieCapture from "@/components/auth/SelfieCapture";
import PhotoEditor from "@/components/compose/PhotoEditor";

const FB = "#1877f2";

const TOUR = [
  { route: "/", target: '[data-tour="event-list"]', title: "Events in your area", body: "This list shows the public events and gatherings happening near you right now." },
  { route: "/", target: '[data-tour="categories"]', title: "Browse by category", body: "Use the categories along the top to filter events — sports, parties, family fun, and more." },
  { route: "/", target: '[data-tour="create-button"]', title: "Create your own", body: "Tap the + at the bottom right to create your own event, party, or gathering." },
  { route: "/create", target: null, title: "Create an event", body: "This is where you create any event. Fill in the details to host your own — try it now or anytime." },
  { route: "/create", target: '[data-tour="hub-button"]', title: "The Social Hub", body: "Tap the person icon at the bottom left to open the Social Kingdom social hub." },
  { route: "/browse", target: '[data-tour="profile-link"]', title: "Your personal profile", body: "Tap 'My Profile' at the top to open your personal profile." },
  { route: "/profile", target: '[data-tour="profile-header"]', title: "This is your profile", body: "Here's your personal profile. Next, let's get you set up." }
];

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("announcement");
  const [tourIndex, setTourIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!alive || !u) return;
      setMe(u);
      const doneKey = `onboarding_done_${u.id}`;
      const pendingKey = `onboarding_pending_${u.id}`;
      const seedKey = `seed_run_v2_${u.id}`;
      const welcomeKey = `welcome_seen_${u.id}`;
      if (localStorage.getItem(doneKey)) return;

      if (localStorage.getItem(pendingKey)) {
        setActive(true);
        setPhase("announcement");
        setTourIndex(0);
        return;
      }
      if (sessionStorage.getItem(seedKey)) return;
      sessionStorage.setItem(seedKey, "1");
      const res = await seedLocalEventsForUser();
      if (!alive) return;
      if (res?.firstInArea) {
        localStorage.setItem(pendingKey, "1");
        window.dispatchEvent(new CustomEvent("sk:area_seeded", { detail: { firstInArea: true } }));
        setActive(true);
        setPhase("announcement");
        setTourIndex(0);
      } else if (!localStorage.getItem(welcomeKey)) {
        setShowWelcome(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Keep the user on the right page for each step.
  useEffect(() => {
    if (!active) return;
    if (phase === "tour") {
      const r = TOUR[tourIndex]?.route;
      if (r) navigate(r);
    } else if (phase === "selfie") {
      navigate("/profile");
    } else if (phase === "bio") {
      navigate("/profile/about");
    }
  }, [active, phase, tourIndex, navigate]);

  function finish() {
    if (me) {
      localStorage.setItem(`onboarding_done_${me.id}`, "1");
      localStorage.removeItem(`onboarding_pending_${me.id}`);
    }
    setActive(false);
  }

  function dismissWelcome() {
    if (me) localStorage.setItem(`welcome_seen_${me.id}`, "1");
    setShowWelcome(false);
  }

  async function onSelfie(fileUri) {
    try {
      const updated = await base44.auth.updateMe({ selfie_uri: fileUri, selfie_verified: true });
      setMe(updated);
    } catch {}
    setPhase("photo");
  }

  async function onPhoto(url) {
    try {
      const updated = await base44.auth.updateMe({ avatar_url: url });
      setMe(updated);
    } catch {}
    setPhase("bio");
  }

  if (showWelcome && !active) {
    return (
      <div className="fixed inset-0 z-[700] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col" style={{ maxHeight: "86vh" }}>
          <div className="px-6 pt-6 pb-2 text-center">
            <h2 className="text-xl font-bold text-gray-900">Welcome to Social Kingdom 👋</h2>
          </div>
          <div className="px-6 pb-4 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-3">
            <p>Social Kingdom connects you with real people through real gatherings — parties, events, activities, and get-togethers near you.</p>
            <p>The more people on the app, the better it works. Invite your friends and family, or host your own event of any kind!</p>
          </div>
          <div className="px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
            <button onClick={dismissWelcome} className="w-full rounded-xl py-3.5 text-base font-bold text-white shadow-md" style={{ background: FB }}>
              Thank You
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!active) return null;

  if (phase === "announcement") {
    return (
      <AnnouncementModal
        onNext={() => {
          setPhase("tour");
          setTourIndex(0);
        }}
        onSkip={finish}
      />
    );
  }

  if (phase === "tour" && TOUR[tourIndex]) {
    return (
      <TourOverlay
        step={TOUR[tourIndex]}
        index={tourIndex}
        total={TOUR.length}
        onNext={() => {
          if (tourIndex < TOUR.length - 1) setTourIndex(tourIndex + 1);
          else setPhase("selfie");
        }}
        onBack={() => {
          if (tourIndex > 0) setTourIndex(tourIndex - 1);
        }}
        onSkip={finish}
      />
    );
  }

  if (phase === "selfie") {
    return (
      <div className="fixed inset-0 z-[900] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <SelfieCapture
            onCaptured={onSelfie}
            title="Verify with a selfie"
            subtitle="Take a quick selfie so we know you're a real person. This stays private on your account."
          />
          <button onClick={() => setPhase("photo")} className="mt-4 w-full text-xs text-gray-400">
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  if (phase === "photo") {
    return (
      <PhotoEditor
        label="Profile Photo"
        aspect="1 / 1"
        onUploaded={onPhoto}
        onClose={() => setPhase("bio")}
      />
    );
  }

  if (phase === "bio") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[900] p-3" style={{ pointerEvents: "none" }}>
        <div
          className="mx-auto max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-4"
          style={{ pointerEvents: "auto", marginBottom: "calc(env(safe-area-inset-bottom) + 4.5rem)" }}
        >
          <h3 className="text-lg font-bold text-gray-900">Add your bio 🎉</h3>
          <p className="text-sm text-gray-600 mt-1">
            This is your Bio section — add your city, interests, and a short intro. Tap any field to fill it in now, or come back anytime.
          </p>
          <button onClick={finish} className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white" style={{ background: FB }}>
            Finish
          </button>
        </div>
      </div>
    );
  }

  return null;
}