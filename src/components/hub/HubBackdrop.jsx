import React from "react";
import { Image } from "@/components/ui/image";
import KingdomLightning from "@/components/hub/KingdomLightning";

export default function HubBackdrop() {
  return (
    <div className="kingdom-backdrop" aria-hidden="true">
      <Image src="https://media.base44.com/images/public/6ac40db708d83e8619ab9efd/7461f73b5_generated_image.png" alt="" className="h-full w-full" />
      <KingdomLightning />
    </div>
  );
}