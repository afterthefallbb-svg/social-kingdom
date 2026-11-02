import React from "react";
import { X } from "lucide-react";
import "@/components/profile/bio-fields.css";

/* Selected bio values rendered as rectangular neon toggles. */
export default function BioChips({ items = [], onRemove }) {
  if (!items.length) return null;
  return (
    <div className="bio-chips">
      {items.map((item) => (
        <span key={item} className="bio-chip">
          {item}
          {onRemove && (
            <button
              type="button"
              className="bio-chip-x"
              aria-label={`Remove ${item}`}
              onClick={() => onRemove(item)}
            >
              <X size={11} />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}