import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import PreferenceDialog from "./PreferenceDialog";

const FIELDS = [
  { field: "bio", label: "Bio", placeholder: "A short intro about you" },
  { field: "traits", label: "Personal Traits", placeholder: "Outgoing, Loyal, Funny" },
  { field: "hobbies", label: "Hobbies", placeholder: "Hiking, Gaming, Cooking" },
  { field: "music", label: "Music", placeholder: "Hip-hop, Jazz, Indie" }
];

export default function AboutCard({ me, onSaved }) {
  const [editing, setEditing] = useState(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-bold text-gray-900 mb-1">About</h3>
      <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
        {FIELDS.map((f) => {
          const raw = me?.[f.field];
          const isArray = f.field !== "bio";
          const has = isArray ? Array.isArray(raw) && raw.length > 0 : !!raw;
          const preview = isArray ? (raw || []).join(", ") : raw || "";
          return (
            <button
              key={f.field}
              onClick={() => setEditing(f)}
              className="w-full flex items-center justify-between py-3 text-left"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                {has ? (
                  <p className="text-xs text-gray-500 truncate">{preview}</p>
                ) : (
                  <p className="text-xs text-gray-400">Add your {f.label.toLowerCase()}</p>
                )}
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0 ml-2" />
            </button>
          );
        })}
      </div>

      {editing && (
        <PreferenceDialog
          field={editing.field}
          label={editing.label}
          placeholder={editing.placeholder}
          me={me}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}