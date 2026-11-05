import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Baby,
  Briefcase,
  Car,
  Church,
  ClipboardList,
  Compass,
  Martini,
  Palette,
  PartyPopper,
  Puzzle,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

/* Line-art glyphs drawn to sit on the enamel face of a pin: 24 × 24, no fill,
   round caps, so every one reads instantly at marker size. */

const ICONS = {
  sports: Trophy,
  daycare: Baby,
  professional: Briefcase,
  drinks: Martini,
  kids: Puzzle,
  automotive: Car,
  resource_fairs: ClipboardList,
  activities: Compass,
  parties: PartyPopper,
  religious: Church,
  family: Users,
  artists: Palette,
  local_sale: ShoppingBag,
};

/* A square, fold-up barbecue with its carry handle across the front — the
   line-art twin of the rest of the set. */
const BARBECUE = `
<rect x="2.6" y="6" width="18.8" height="12.8" rx="2.2"/>
<path d="M2.6 9.9h18.8"/>
<path d="M12 6V3.4"/>
<path d="M9.1 13.9h5.8a1.7 1.7 0 0 1 0 3.4H9.1a1.7 1.7 0 0 1 0-3.4z"/>
<path d="M5.6 18.8v1.9M18.4 18.8v1.9"/>`;

function iconMarkup(Glyph) {
  const svg = renderToStaticMarkup(
    React.createElement(Glyph, {
      size: 24,
      strokeWidth: 2.1,
      fill: "none",
      color: "#ffffff",
      "aria-hidden": true,
    })
  );
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "");
}

export function pinGlyphMarkup(categoryId) {
  if (categoryId === "barbecue") return BARBECUE;
  const Glyph = ICONS[categoryId] || Sparkles;
  return iconMarkup(Glyph);
}