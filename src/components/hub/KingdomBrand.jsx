import React from "react";
import { Crown } from "lucide-react";

export default function KingdomBrand() {
  return (
    <div className="kingdom-brand" role="img" aria-label="Social Kingdom">
      <span className="kingdom-brand-social" aria-hidden="true">Social</span>{" "}
      <span className="kingdom-brand-name" aria-hidden="true"><span className="kingdom-brand-initial">K<Crown className="kingdom-crown" strokeWidth={1.3} /></span>ingdom</span>
    </div>
  );
}