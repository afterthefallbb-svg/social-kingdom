import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { TOUR_STEPS, TOUR_KEY } from "@/components/tour/tourSteps";
import "@/components/tour/tour.css";

const PAD = 8;

/* A short, hands-off walk through the app: the spotlight finds each element by
   its data-tour marker, moves to the page it lives on, and the card explains it.
   Skip is always at the bottom, and the tour only ever runs once per device. */
export default function GuidedTour() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return undefined;
    const timer = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(timer);
  }, []);

  const step = TOUR_STEPS[index];

  useEffect(() => {
    if (!open || !step) return undefined;
    if (step.route && pathname !== step.route) navigate(step.route);
    setRect(null);
    if (!step.target) return undefined;

    let alive = true;
    let retry = null;
    const measure = () => {
      const el = document.querySelector(step.target);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      return true;
    };
    const find = () => {
      if (!alive) return;
      if (!measure()) retry = setTimeout(find, 140);
    };
    find();

    const remeasure = () => measure();
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, true);
    return () => {
      alive = false;
      clearTimeout(retry);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure, true);
    };
  }, [open, index, pathname, step, navigate]);

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setOpen(false);
  }, []);

  const next = () => {
    if (index >= TOUR_STEPS.length - 1) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
  };

  const primary = () => {
    if (step?.action === "signup") {
      finish();
      navigate("/register");
      return;
    }
    next();
  };

  if (!open || !step || typeof document === "undefined") return null;

  // The hand always sits on the side of the element closer to the middle of the
  // screen, so it never lands off the edge.
  const pointerBelow = rect ? rect.top + rect.height / 2 < window.innerHeight * 0.55 : true;

  return createPortal(
    <div className="sk-tour" role="dialog" aria-modal="true" aria-label="App tour">
      <div className={`sk-tour-veil${rect ? " is-cutout" : ""}`} />
      {rect && (
        <div
          className="sk-tour-spot"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
          aria-hidden="true"
        />
      )}
      {rect && (
        <span
          className="sk-tour-hand"
          style={
            pointerBelow
              ? { top: rect.top + rect.height + 2, left: rect.left + rect.width / 2 - 15 }
              : { top: rect.top - 32, left: rect.left + rect.width / 2 - 15 }
          }
          aria-hidden="true"
        >
          {pointerBelow ? "👇" : "👆"}
        </span>
      )}

      <div className="sk-tour-card">
        <p className="sk-tour-step">Step {index + 1} of {TOUR_STEPS.length}</p>
        <h2>{step.title}</h2>
        <p className="sk-tour-body">{step.body}</p>
        <div className="sk-tour-actions">
          <button type="button" className="sk-tour-next" onClick={primary}>
            {step.cta || "Next"}
            <ChevronRight size={16} />
          </button>
          <button type="button" className="sk-tour-skip" onClick={finish}>
            Skip tour
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}