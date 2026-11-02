// Shared control tints so fields and toggles read clearly against the page
// backdrop and match the neon accent language of the hub.
export const NEON = {
  // Filled inputs, selects, textareas, search boxes - neutral, never glaring
  field: {
    background: "#eef0f3",
    borderColor: "#d3d8e0",
    color: "#1f2430",
  },
  // Unselected chip / toggle: vivid electric-blue edge on an ice fill
  chip: {
    background: "#dcecff",
    borderColor: "#1a73ff",
    color: "#0b3fa8",
  },
  // Selected chip / toggle: lit royal-to-electric gradient
  on: {
    background: "linear-gradient(135deg, #2f8bff 0%, #0a58d0 100%)",
    borderColor: "#0a58d0",
    color: "#ffffff",
    boxShadow: "0 2px 10px rgba(26, 115, 255, 0.35)",
  },
  border: "#1a73ff",
  fill: "#dcecff",
  text: "#0b3fa8",
  solid: "#1a73ff",
};