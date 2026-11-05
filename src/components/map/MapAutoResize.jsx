import { useEffect } from "react";
import { useMap } from "react-leaflet";

/* Leaflet measures its container once, at mount. The map mounts inside a route
   transition — and sometimes before the layout has settled — so it caches a box
   smaller than the real map area and only ever requests tiles for that box,
   leaving the rest of the screen empty. Re-measure whenever the container's box
   actually changes, and once more after the entrance transition lands. */
export default function MapAutoResize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;
    const remeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.invalidateSize({ animate: false, pan: false }));
    };

    const observer = new ResizeObserver(remeasure);
    observer.observe(container);
    window.addEventListener("orientationchange", remeasure);
    const timers = [0, 150, 500].map((delay) => setTimeout(remeasure, delay));

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("orientationchange", remeasure);
      timers.forEach(clearTimeout);
    };
  }, [map]);

  return null;
}