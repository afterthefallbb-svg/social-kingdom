import React from "react";
import { Trash2, Undo2, X } from "lucide-react";

// Bottom sheet shown after long-pressing a single message.
export default function MessageActions({ message, mine, onDeleteForMe, onUnsend, onClose }) {
  if (!message) return null;
  const preview = message.content || (message.image_url ? "Photo" : "Message");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl p-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2 px-2 pb-2">
          <p className="flex-1 text-xs text-gray-500 break-words max-h-16 overflow-hidden">{preview}</p>
          <button onClick={onClose} aria-label="Cancel" className="shrink-0">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <button
          onClick={onDeleteForMe}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl active:bg-gray-100 text-sm font-semibold text-gray-800"
        >
          <Trash2 size={18} /> Delete from my messages
        </button>

        {mine && (
          <button
            onClick={onUnsend}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl active:bg-gray-100 text-sm font-semibold text-red-600"
          >
            <Undo2 size={18} /> Unsend for everyone
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full mt-1 px-3 py-3 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}