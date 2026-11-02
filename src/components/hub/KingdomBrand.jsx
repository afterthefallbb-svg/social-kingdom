import React from "react";
import { Crown } from "lucide-react";

export default function KingdomBrand() {
  return (
    <div className="kingdom-brand" role="img" aria-label="Social Kingdom">
      <span className="kingdom-brand-social" aria-hidden="true">Social<Crown className="kingdom-crown" strokeWidth={1.4} /></span>
      <span className="kingdom-brand-name" aria-hidden="true">Kingdom</span>
    </div>
  );
}