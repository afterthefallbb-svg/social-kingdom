// Marketplace item categories, ordered most-popular-first (left to right).
// Popularity order based on common resale/marketplace search volume.
export const MARKETPLACE_CATEGORIES = [
  { id: "electronics", label: "Electronics", emoji: "📱" },
  { id: "clothing", label: "Clothing", emoji: "👗" },
  { id: "furniture", label: "Furniture", emoji: "🛋️" },
  { id: "vehicles", label: "Vehicles", emoji: "🚗" },
  { id: "home_garden", label: "Home & Garden", emoji: "🪴" },
  { id: "sports", label: "Sports & Outdoors", emoji: "⚽" },
  { id: "toys", label: "Toys & Games", emoji: "🎲" },
  { id: "baby_kids", label: "Baby & Kids", emoji: "🧸" },
  { id: "tools", label: "Tools", emoji: "🔧" },
  { id: "musical_instruments", label: "Musical Instruments", emoji: "🎸" },
  { id: "health_beauty", label: "Health & Beauty", emoji: "💄" },
  { id: "books_media", label: "Books & Media", emoji: "📚" },
  { id: "pet_supplies", label: "Pet Supplies", emoji: "🐾" },
  { id: "jewelry", label: "Jewelry", emoji: "💍" },
  { id: "appliances", label: "Appliances", emoji: "🧊" },
  { id: "real_estate", label: "Real Estate", emoji: "🏠" },
  { id: "free", label: "Free Stuff", emoji: "🎁" }
];

export const MARKETPLACE_CATEGORY_MAP = Object.fromEntries(
  MARKETPLACE_CATEGORIES.map((c) => [c.id, c])
);

export function getMarketplaceCategory(id) {
  return MARKETPLACE_CATEGORY_MAP[id] || MARKETPLACE_CATEGORIES[0];
}