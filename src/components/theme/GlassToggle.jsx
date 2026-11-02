import React from "react";
import { cn } from "@/lib/utils";
import "@/components/theme/glass-controls.css";

export default function GlassToggle({ selected, tone = "blue", className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected === undefined ? undefined : selected}
      data-tone={tone}
      data-selected={selected ? "true" : "false"}
      className={cn("sk-glass-control", className)}
      {...props}
    >
      <span className="sk-glass-control-content">{children}</span>
    </button>
  );
}