import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const FB = "#1877f2";

/* A native-touch friendly replacement for the browser <select>: a field that
   opens a bottom action sheet with the options. */
export default function ActionSelect({ label, value, options, onChange, placeholder = "Select", id }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="listbox"
        aria-label={label}
        className="w-full h-10 rounded-md border border-input bg-background px-3 flex items-center justify-between gap-2 text-sm text-left"
      >
        <span className={`truncate ${current ? "text-gray-900" : "text-gray-400"}`}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            role="listbox"
            aria-label={label}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-2xl max-h-[70vh] flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">{label}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold px-2 py-1"
                style={{ color: FB }}
              >
                Done
              </button>
            </div>
            <div className="overflow-y-auto py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
              {options.map((o) => {
                const selected = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-left active:bg-gray-100"
                  >
                    <span className={`truncate ${selected ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {o.label}
                    </span>
                    {selected && <Check size={16} style={{ color: FB }} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}