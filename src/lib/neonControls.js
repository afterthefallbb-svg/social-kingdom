// Shared control tints so fields and toggles read clearly against the page
// backdrop and match the neon accent language of the hub.
// Unselected toggles are lit neon blue; selected ones switch to a deep royal
// with a neon cyan rim so the two states can never be confused.
export const NEON = {
  // Filled inputs, selects, textareas, search boxes - neutral, never glaring
  field: {
    background: "#eef0f3",
    borderColor: "#d3d8e0",
    color: "#1f2430",
  },
  // Resting chip / toggle: the hub's bright neon blue
  chip: {
    background: "linear-gradient(135deg, #3ab8ff 0%, #1560ff 100%)",
    borderColor: "#8fe9ff",
    color: "#ffffff",
    boxShadow: "0 0 10px rgba(46, 166, 255, 0.55), inset 0 0 6px rgba(255, 255, 255, 0.32)",
  },
  // Selected chip / toggle: deep royal, lit from its cyan rim
  on: {
    background: "linear-gradient(135deg, #0a2f8f 0%, #05153f 100%)",
    borderColor: "#5fe9ff",
    color: "#ffffff",
    boxShadow: "0 0 12px rgba(0, 214, 255, 0.6), inset 0 0 8px rgba(95, 233, 255, 0.5)",
  },
  // Soft ice fill for selected list rows / panels
  soft: "#dcecff",
  border: "#2f8bff",
  fill: "#2f8bff",
  text: "#0b3fa8",
  solid: "#2f8bff",
};