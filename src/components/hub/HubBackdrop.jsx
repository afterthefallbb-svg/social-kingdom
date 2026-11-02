import React from "react";
import KingdomLightning from "@/components/hub/KingdomLightning";
import KingdomAccents from "@/components/hub/KingdomAccents";

export default function HubBackdrop() {
  return (
    <div className="kingdom-backdrop" aria-hidden="true">
      <KingdomAccents />
      <KingdomLightning />
    </div>
  );
}