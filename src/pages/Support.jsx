import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const FB = "#1877f2";

const FAQS = [
  {
    q: "Creating your social media page",
    a: "Tap the profile icon in the bottom-left to open your social hub. Tap your photo at the top to open your personal profile, then tap Edit to add your photo, background image, and bio.",
  },
  {
    q: "Editing your social media page",
    a: "Open your profile and tap Edit. You can update your photo, background, name, location, and bio at any time, and your changes save automatically.",
  },
  {
    q: "Creating an event",
    a: "Tap the plus button in the bottom-right, then fill in the title, category, and details. Drop a pin on the map to set exactly where the event happens.",
  },
  {
    q: "Finding events",
    a: "Tap the map button in the bottom-center to see gatherings near you. Use the search bar at the top and the category filters to narrow down what you're looking for.",
  },
  {
    q: "Getting directions to an event",
    a: "Open any event from the map or the social hub, then tap the address or the map to open turn-by-turn directions in your phone's maps app.",
  },
];

const SAFETY = [
  "Attend events with people you know whenever possible.",
  "If you're meeting new people, tell a friend or family member where you're going and who you'll be with before you leave.",
  "Keep your phone charged and with you at all times so you can contact emergency services if needed.",
  "Meet in public, well-lit places, especially for first-time meetups.",
  "Children must not attend events without a parent or guardian.",
  "Trust your instincts — if something feels off, leave and find help.",
];

export default function Support() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Support</span>
      </div>

      <div className="px-4 mt-5 space-y-6">
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-sm mb-1" style={{ color: FB }}>{f.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h2 className="font-bold text-gray-900 text-base mb-3">Event Safety</h2>
          <p className="text-sm text-gray-600 mb-3">
            Your safety is our number one concern. Please follow these guidelines when attending events:
          </p>
          <ul className="space-y-2">
            {SAFETY.map((s) => (
              <li key={s} className="text-sm text-gray-600 flex gap-2">
                <span style={{ color: FB }}>•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Still need help? Visit our{" "}
            <button onClick={() => navigate("/contact")} className="font-semibold underline" style={{ color: FB }}>
              Contact Us
            </button>{" "}
            page.
          </p>
          <p className="text-sm text-gray-600 mt-3">
            Read our{" "}
            <button onClick={() => navigate("/privacy")} className="font-semibold underline" style={{ color: FB }}>
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}