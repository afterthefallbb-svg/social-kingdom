import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Mail, X } from "lucide-react";
import { signInWithProvider } from "@/lib/authMfaFlow";
import GoogleIcon from "@/components/GoogleIcon";

/* The one door in: it only appears when a visitor actually tries to do something
   that needs an account (attend, message, join a CliQ, create a gathering). */
function MicrosoftGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function SignUpSheet({ open, intent = "", onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  const returnTo = window.location.pathname + window.location.search;
  const go = (path) => {
    onClose?.();
    navigate(path);
  };

  // Rendered on the body so no header's stacking context or the bottom bar can
  // ever paint over the sheet.
  return createPortal(
    <div
      className="fixed inset-0 z-[2147483200] flex items-end sm:items-center justify-center"
      style={{ pointerEvents: "auto" }}
    >
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Join Social Kingdom"
        className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-white px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <h2 className="pr-8 text-lg font-bold leading-tight text-gray-900">
          {intent || "Join Social Kingdom"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Create a free account to meet the people and gatherings around you.
        </p>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => signInWithProvider("google", returnTo)}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-800"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <button
            type="button"
            onClick={() => signInWithProvider("microsoft", returnTo)}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-800"
          >
            <MicrosoftGlyph /> Continue with Microsoft
          </button>
          <button
            type="button"
            onClick={() => go("/register")}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold text-white"
            style={{ background: "#1877f2" }}
          >
            <Mail size={18} /> Continue with email
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <button type="button" onClick={() => go("/login")} className="font-semibold text-[#1877f2]">
            Log in
          </button>
        </p>
      </div>
    </div>,
    document.body
  );
}