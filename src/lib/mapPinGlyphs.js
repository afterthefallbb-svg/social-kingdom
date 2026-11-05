import {
  Tag, Mic, Dribbble, Palette, PartyPopper, Wine, Beef, Baby,
  Users, Briefcase, Handshake, Church, Car, MapPin,
} from "lucide-react";

/* Crisp vector glyphs for the map pins — one per event category, so the pins
   stay sharp at any screen density instead of relying on an emoji font. */
const PIN_GLYPHS = {
  local_sale: Tag,
  artists: Mic,
  sports: Dribbble,
  activities: Palette,
  parties: PartyPopper,
  drinks: Wine,
  barbecue: Beef,
  kids: Baby,
  family: Users,
  professional: Briefcase,
  resource_fairs: Handshake,
  religious: Church,
  automotive: Car,
  daycare: Baby,
};

export function pinGlyphFor(categoryId) {
  return PIN_GLYPHS[categoryId] || MapPin;
}