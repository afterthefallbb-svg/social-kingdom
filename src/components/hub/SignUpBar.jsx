import React from "react";
import { useNavigate } from "react-router-dom";
import useGuest from "@/hooks/useGuest";
import "@/components/hub/signup-bar.css";

/* Visitors see one large, unmistakable way in, on both main screens. It waits
   for the auth check, so a signed-in person never sees it flash. */
export default function SignUpBar({ className = "" }) {
  const navigate = useNavigate();
  const { checking, guest } = useGuest();
  if (checking || !guest) return null;
  return (
    <button
      type="button"
      onClick={() => navigate("/register")}
      className={`sk-signup ${className}`}
    >
      Sign Up Now
    </button>
  );
}