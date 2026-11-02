import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import CityField from "@/components/profile/CityField";

const FB = "#1877f2";
const TEXT_FIELDS = ["bio", "job", "birthday", "location"];

const toArray = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function PreferenceDialog({ field, label, placeholder, me, onClose, onSaved }) {
  const isText = TEXT_FIELDS.includes(field);
  const isCity = field === "location";
  const [value, setValue] = useState(
    isText ? me?.[field] || "" : (me?.[field] || []).join(", ")
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const payload = isText ? { [field]: value.trim() } : { [field]: toArray(value) };
      const updated = await base44.auth.updateMe(payload);
      onSaved(updated);
      onClose();
      toast({ title: `${label} updated` });
    } catch (e) {
      toast({ title: "Could not save", description: String(e.message || e) });
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/40"
      style={{ zIndex: 2147483100, paddingBottom: "env(safe-area-inset-bottom)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="font-bold text-gray-900">Edit {label}</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {isCity ? (
            <>
              <CityField value={value} onChange={setValue} placeholder={placeholder} />
              <p className="text-xs text-gray-400 mt-1.5">Pick your city from the list so it's spelled correctly.</p>
            </>
          ) : (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              autoFocus
              placeholder={placeholder}
            />
          )}
          {!isText && <p className="text-xs text-gray-400 mt-1.5">Separate each with a comma.</p>}
        </div>
        <div className="flex gap-2 p-4 border-t bg-white" style={{ borderColor: "#e5e7eb" }}>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 text-white"
            style={{ background: FB }}
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}