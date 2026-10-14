import React, { useState } from "react";
import { X, Search, Check, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { BIO_OPTIONS } from "@/lib/bioOptions";

const FB = "#1877f2";

export default function BioPickerDialog({ field, label, placeholder, me, onClose, onSaved }) {
  const [selected, setSelected] = useState(new Set(me?.[field] || []));
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const options = BIO_OPTIONS[field] || [];
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  const exact = options.find((o) => o.toLowerCase() === q);

  function toggle(opt) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const updated = await base44.auth.updateMe({ [field]: [...selected] });
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
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="font-bold text-gray-900">Edit {label}</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {selected.size > 0 && (
          <div className="px-4 pt-3 flex flex-wrap gap-2">
            {[...selected].map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                style={{ background: FB }}
              >
                {s}
                <button onClick={() => toggle(s)} aria-label={`Remove ${s}`}>
                  <X size={12} color="#fff" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="px-4 pt-3 bg-white">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto p-3 flex-1 space-y-1">
          {filtered.length === 0 && !q && (
            <p className="text-sm text-gray-400 text-center py-4">No suggestions for this category.</p>
          )}
          {filtered.map((opt) => {
            const on = selected.has(opt);
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left border border-gray-100"
                style={{ background: on ? "#eef5ff" : "#fff" }}
              >
                <span className="text-sm font-medium text-gray-800">{opt}</span>
                {on && <Check size={16} style={{ color: FB }} />}
              </button>
            );
          })}
          {q && !exact && (
            <button
              onClick={() => {
                toggle(query.trim());
                setQuery("");
              }}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left border border-dashed border-gray-300 mt-2"
            >
              <Plus size={16} style={{ color: FB }} />
              <span className="text-sm font-medium text-gray-700">Add "{query.trim()}"</span>
            </button>
          )}
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
    </div>
  );
}