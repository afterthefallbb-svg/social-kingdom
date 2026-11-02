import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import BioOptionsPicker from "@/components/profile/BioOptionsPicker";
import { BIO_OPTIONS } from "@/lib/bioOptions";

const FB = "#1877f2";

/* Modal wrapper around the searchable bio database. onSave receives the
   selected values (it may hit the backend or just update local state). */
export default function BioPickerDialog({ field, label, options, value = [], onSave, onClose }) {
  const [selected, setSelected] = useState(value);
  const [saving, setSaving] = useState(false);
  const list = options || BIO_OPTIONS[field] || [];

  async function save() {
    setSaving(true);
    try {
      await onSave(selected);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/40"
      style={{ zIndex: 2147483120, paddingBottom: "env(safe-area-inset-bottom)" }}
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

        <div className="flex-1 min-h-0 overflow-y-auto">
          <BioOptionsPicker label={label} options={list} value={selected} onChange={setSelected} />
        </div>

        <div className="p-4 border-t flex gap-2" style={{ borderColor: "#e5e7eb" }}>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 text-white" style={{ background: FB }} disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}