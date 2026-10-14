import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FB = "#1877f2";

export default function WelcomePopup() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!active || !u) return;
      setMe(u);
      const key = `welcome_seen_${u.id}`;
      if (!localStorage.getItem(key)) {
        setShow(true);
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
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
        <button onClick={dismiss} aria-label="Close" className="absolute top-3 right-3 text-gray-400">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Welcome to Meet Me 👋</h2>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          Meet Me is designed around your convenience, to make gathering easier and to
          improve your everyday quality of life. We're here to serve you, help you connect,
          and succeed where other social apps have fallen short.
        </p>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          We're rolling the app out now and tailoring it as we go — please excuse any rough
          edges along the way. Your feedback shapes what we build next.
        </p>
        <div className="flex flex-col gap-2 mt-5">
          <button
            onClick={() => { dismiss(); navigate("/contact"); }}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white"
            style={{ background: FB }}
          >
            Give Feedback
          </button>
          <button onClick={dismiss} className="w-full rounded-lg py-2.5 text-sm font-semibold text-gray-600 bg-gray-100">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}