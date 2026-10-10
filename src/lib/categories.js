export const CATEGORIES = [
  { id: "sports", label: "Sports", emoji: "🏀", color: "#f97316" },
  { id: "daycare", label: "Daycare", emoji: "👶", color: "#ec4899" },
  { id: "professional", label: "Professional", emoji: "💼", color: "#3b82f6" },
  { id: "drinks", label: "Drinks", emoji: "🍷", color: "#8b5cf6" },
  { id: "kids", label: "Kids", emoji: "🧒", color: "#22c55e" },
  { id: "barbecue", label: "Barbecue", emoji: "🍖", color: "#ef4444" },
  { id: "automotive", label: "Automotive", emoji: "🚗", color: "#64748b" },
  { id: "resource_fairs", label: "Resource Fairs", emoji: "🤝", color: "#14b8a6" },
  { id: "activities", label: "Activities", emoji: "🎨", color: "#06b6d4" },
  { id: "parties", label: "Parties", emoji: "🎉", color: "#d946ef" },
  { id: "religious", label: "Religious", emoji: "⛪", color: "#f59e0b" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧", color: "#10b981" },
  { id: "artists", label: "Artists", emoji: "🎤", color: "#9333ea" },
  { id: "local_sale", label: "Local Sale", emoji: "🏷️", color: "#0ea5e9" }
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id) {
  return CATEGORY_MAP[id] || CATEGORIES[0];
}