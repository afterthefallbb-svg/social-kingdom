import React, { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 70;
const MAX = 110;

/* Pull down from the very top of a page to refresh it. The gesture only arms
   while the window is already scrolled to the top, so it never fights normal
   scrolling. */
export default function PullToRefresh({ onRefresh, children }) {
  const wrap = useRef(null);
  const startY = useRef(null);
  const pullRef = useRef(0);
  const busyRef = useRef(false);
  const refreshRef = useRef(onRefresh);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  refreshRef.current = onRefresh;

  function applyPull(v) {
    pullRef.current = v;
    setPull(v);
  }

  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;

    const atTop = () => (window.scrollY || document.documentElement.scrollTop || 0) <= 0;

    const onStart = (e) => {
      if (busyRef.current || !atTop()) return;
      startY.current = e.touches[0].clientY;
    };

    const onMove = (e) => {
      if (busyRef.current || startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0 || !atTop()) {
        if (pullRef.current) applyPull(0);
        return;
      }
      const dist = Math.min(MAX, dy * 0.55);
      applyPull(dist);
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = async () => {
      if (startY.current == null) return;
      startY.current = null;
      if (pullRef.current < THRESHOLD) {
        applyPull(0);
        return;
      }
      busyRef.current = true;
      setRefreshing(true);
      applyPull(THRESHOLD);
      try {
        await refreshRef.current?.();
      } finally {
        busyRef.current = false;
        setRefreshing(false);
        applyPull(0);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const ready = pull >= THRESHOLD;

  return (
    <div ref={wrap}>
      <div
        aria-hidden={pull === 0}
        className="flex items-end justify-center overflow-hidden"
        style={{ height: pull, transition: refreshing ? "height 160ms ease" : undefined }}
      >
        <RefreshCw
          size={22}
          className={`mb-1 ${refreshing ? "animate-spin" : ""}`}
          style={{ color: "#1877f2", opacity: Math.min(1, pull / THRESHOLD), transform: ready ? "rotate(180deg)" : undefined }}
        />
      </div>
      {children}
    </div>
  );
}