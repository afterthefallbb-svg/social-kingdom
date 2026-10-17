import React from "react";
import { Trash2, Users, X } from "lucide-react";

const FB = "#1877f2";

export default function ConversationSelectBar({ count, onCancel, onDelete, onGroup }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-white border-t shadow-2xl rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onCancel} className="flex items-center gap-1 text-sm text-gray-500">
          <X size={16} /> Cancel
        </button>
        <span className="text-sm font-semibold text-gray-900">{count} selected</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onGroup}
          disabled={count < 1}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: FB }}
        >
          <Users size={16} /> Create Group
        </button>
        <button
          onClick={onDelete}
          disabled={count < 1}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "#dc2626" }}
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}