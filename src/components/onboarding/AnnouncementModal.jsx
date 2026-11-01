import React from "react";

const FB = "#1877f2";

export default function AnnouncementModal({ onNext, onSkip, seeded = true }) {
  return (
    <div className="fixed inset-0 z-[900] bg-black/60 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden"
        style={{ maxHeight: "88vh" }}
      >
        <div className="px-6 pt-6 pb-2 text-center">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "#e8f0fe" }}
          >
            👑
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-3">Welcome to Social Kingdom!</h2>
        </div>
        <div className="px-6 pb-4 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-3">
          {seeded ? (
            <>
              <p>
                We created <strong>5 real local parties and events near you</strong> to demonstrate how
                Social Kingdom works — they're already on your map.
              </p>
              <p>
                <strong>Social Kingdom is hosting these events itself</strong> as a demonstration — so go
                ahead and <strong>invite your friends and family</strong> to join you.
              </p>
            </>
          ) : (
            <>
              <p>
                Social Kingdom connects you with real people through the gatherings happening near you.
              </p>
              <p>
                Go ahead and <strong>invite your friends and family</strong> — the more people join, the
                better it works for everyone near you.
              </p>
            </>
          )}
          <p>
            These are real parties, events, and get-togethers. More people are joining every day, and the
            more people on the app, the better it works for everyone near you!
          </p>
          <p>
            You can also <strong>create your own event, party, or gathering</strong> of any kind, anytime.
          </p>
          <p className="font-semibold text-gray-900">Want a quick tour of how everything works?</p>
        </div>
        <div className="px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 space-y-2">
          <button
            onClick={onNext}
            className="w-full rounded-xl py-3.5 text-base font-bold text-white shadow-md"
            style={{ background: FB }}
          >
            Show me around
          </button>
          <button onClick={onSkip} className="w-full text-xs text-gray-400 py-1">
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
}