import React from "react";
import "./kingdom-theme.css";
import "./kingdom-chrome.css";
import KingdomAccents from "@/components/hub/KingdomAccents";

/* App-wide kingdom backdrop: no city skyline on inner pages, just the deep
   ink field, its blue auras and the fixed lightning accents sitting behind
   the content. */
export default function KingdomBackdrop() {
  return (
    <div className="sk-backdrop" aria-hidden="true">
      <span className="sk-backdrop-aura" />
      <KingdomAccents />
    </div>
  );
}