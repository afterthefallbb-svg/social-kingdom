import React from "react";
import { Image } from "@/components/ui/image";

export default function KingdomBrand() {
  return (
    <div className="kingdom-brand" role="img" aria-label="Social Kingdom">
      <Image src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/69f1a50ae_kingdom-precise-social.png" alt="" className="kingdom-brand-social" fittingType="fit" quality={100} loading="eager" />
      <span className="kingdom-brand-name" aria-hidden="true">
        <Image src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/5a878db36_kingdom-precise-crown.png" alt="" className="kingdom-crown" fittingType="fit" quality={100} loading="eager" />
        <Image src="https://base44.app/api/apps/6ac40db708d83e8619ab9efd/files/mp/public/6ac40db708d83e8619ab9efd/ec7f4e51f_kingdom-precise-kingdom.png" alt="" className="kingdom-brand-lettering" fittingType="fit" quality={100} loading="eager" />
      </span>
    </div>
  );
}