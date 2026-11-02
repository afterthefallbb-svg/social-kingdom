import React from "react";
import { Globe, Lock } from "lucide-react";
import GlassToggle from "@/components/theme/GlassToggle";

export default function EventVisibilityPicker({ visibility, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-kingdom-muted">Visibility</label>
      <div className="grid grid-cols-2 gap-2 mt-1.5">
        <GlassToggle selected={visibility === "public"} onClick={() => onChange("public")} className="gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold">
          <Globe size={16} /> Public
        </GlassToggle>
        <GlassToggle selected={visibility === "personal"} onClick={() => onChange("personal")} className="gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold">
          <Lock size={16} /> Personal
        </GlassToggle>
      </div>
      <p className="text-xs text-kingdom-muted/70 mt-1.5">
        {visibility === "public"
          ? "Anyone on the map can discover this gathering."
          : "Only shared with your CliQ — not shown on the public map."}
      </p>
    </div>
  );
}