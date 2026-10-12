import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const FB = "#1877f2";

export default function Groups() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Groups</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />
      <p className="px-4 mt-6 text-sm text-gray-400">Groups are coming soon.</p>
    </div>
  );
}