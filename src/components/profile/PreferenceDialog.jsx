import React, { useState } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const FB = "#1877f2";

const toArray = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function PreferenceDialog({ field, label, placeholder, me, onClose, onSaved }) {
  const isBio = field === "bio";
  const [value, setValue] = useState(
    isBio ? me?.bio || "" : (me?.[field] || []).join(", ")
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const payload = isBio ? { bio: value.trim() } : { [field]: toArray(value) };
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

  return (
    <div
      className="fixed inset-0 z-[700] flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="font-bold text-gray-900">Edit {label}</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            autoFocus
            placeholder={placeholder}
          />
          {!isBio && <p className="text-xs text-gray-400 mt-1.5">Separate each with a comma.</p>}
          <div className="flex gap-2 mt-3">
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
      </div>
    </div>
  );
}