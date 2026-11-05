import React from "react";
import { Image } from "@/components/ui/sk-image";

/* Crown and lettering are stacked from the same artwork at full width, so the
   crown stays perfectly centred over the K with a clear gap above it. */
export default function KingdomBrand() {
  return (
    <h1 className="kingdom-brand">
      <Image src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/176e89ee7_social-kingdom-crown-v2.png" alt="" aria-hidden="true" className="kingdom-brand-crown" fittingType="fit" width={453} height={61} quality={100} loading="eager" />
      <Image src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/973003b5b_social-kingdom-wordmark-v2.png" alt="Social Kingdom" className="kingdom-brand-word" fittingType="fit" width={453} height={70} quality={100} loading="eager" />
    </h1>
  );
}