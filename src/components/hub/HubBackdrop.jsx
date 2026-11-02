import React from "react";
import KingdomLightning from "@/components/hub/KingdomLightning";

export default function HubBackdrop() {
  return (
    <div className="kingdom-backdrop" aria-hidden="true">
      <KingdomLightning />
    </div>
  );
}