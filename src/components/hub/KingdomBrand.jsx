import React from "react";
import { Image } from "@/components/ui/sk-image";

/* Crown and lettering are stacked from the same artwork at full width, so the
   crown stays perfectly centred over the K with a clear gap above it. */
export default function KingdomBrand() {
  return (
    <h1 className="kingdom-brand">
      <Image src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/1c94a1256_social-kingdom-crown-crisp.png" alt="" aria-hidden="true" className="kingdom-brand-crown" fittingType="fit" width={453} height={69} quality={100} loading="eager" />
      <Image src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/a2def5eb8_social-kingdom-wordmark-crisp.png" alt="Social Kingdom" className="kingdom-brand-word" fittingType="fit" width={453} height={84} quality={100} loading="eager" />
    </h1>
  );
}