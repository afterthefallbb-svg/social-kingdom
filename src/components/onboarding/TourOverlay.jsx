import React, { useCallback, useEffect, useState } from "react";
import { MousePointerClick } from "lucide-react";

const FB = "#1877f2";

function getRect(selector) {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom };
}

export default function TourOverlay({ step, index, total, onNext, onBack, onSkip }) {
  const [rect, setRect] = useState(null);

  const update = useCallback(() => {
    if (!step.target) {
      setRect(null);
      return;
    }
    setRect(getRect(step.target));
  }, [step.target]);

  useEffect(() => {
    let raf;
    let tries = 0;
    const loop = () => {
      if (!step.target) {
        setRect(null);
        return;
      }
      const r = getRect(step.target);
      if (r) {
        setRect(r);
        return;
      }
      if (tries++ < 60) raf = requestAnimationFrame(loop);
      else setRect(null);
    };
    loop();
    const onChange = () => update();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    const iv = setInterval(update, 500);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
      clearInterval(iv);
    };
  }, [step.target, update]);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(360, vw - 32);
  const cardStyle = { width: cardW, left: (vw - cardW) / 2, maxHeight: "60vh" };
  if (rect) {
    if (vh - rect.bottom > 220 || rect.top < vh / 2) {
      cardStyle.top = Math.min(rect.bottom + 16, vh - 240);
    } else {
      cardStyle.bottom = vh - rect.top + 16;
    }
  } else {
    cardStyle.bottom = 24;
  }

  return (
    <div className="fixed inset-0 z-[900]">
      <div className="absolute inset-0" />
      {rect ? (
        <>
          <div
            style={{
              position: "fixed",
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
              borderRadius: 14,
              border: `3px solid ${FB}`,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
              pointerEvents: "none"
            }}
          />
          <MousePointerClick
            size={32}
            className="fixed animate-bounce"
            style={{
              left: Math.min(Math.max(8, rect.left + rect.width - 22), vw - 40),
              top: Math.min(Math.max(8, rect.top + rect.height - 22), vh - 42),
              color: FB,
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.45))",
              pointerEvents: "none",
              zIndex: 901
            }}
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/55" />
      )}

      <div className="fixed bg-white rounded-2xl shadow-2xl p-5 overflow-y-auto" style={cardStyle}>
        <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: FB }}>
          Step {index + 1} of {total}
        </p>
        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.body}</p>
        <div className="flex items-center justify-between mt-4">
          <button onClick={onSkip} className="text-xs font-medium text-gray-400">
            Skip
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                onClick={onBack}
                className="rounded-lg px-3 py-2 text-sm font-semibold border border-gray-200 text-gray-600"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ background: FB }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}