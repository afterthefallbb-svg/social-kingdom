import React from "react";
import { Plus } from "lucide-react";

const FB = "#1877f2";

export default function VideoCreateButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full pl-3 pr-2 py-1.5 text-sm font-semibold text-white"
      style={{ background: FB }}
    >
      Create <Plus size={16} />
    </button>
  );
}