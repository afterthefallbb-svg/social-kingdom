import React from "react";
import { Image } from "@/components/ui/image";
import KingdomLightning from "@/components/hub/KingdomLightning";

export default function HubBackdrop() {
  return (
    <div className="kingdom-backdrop" aria-hidden="true">
      <Image src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/79ec2cb06_kingdom-reference-backdrop.png" alt="" className="kingdom-backdrop-texture" />
      <KingdomLightning />
    </div>
  );
}