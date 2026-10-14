import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Gamepad2 } from "lucide-react";

const FB = "#1877f2";

// Placeholder so the new Games link opens a real window — full games come next.
export default function Games() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <button onClick={() => navigate(-1)} aria-label="Back" className="p-1">
          <ChevronLeft size={24} color="#000000" />
        </button>
        <h1 className="text-xl font-bold">Games</h1>
      </div>
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: FB + "18" }}>
          <Gamepad2 size={30} color={FB} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mt-4">Games are on the way</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
          We're putting the finishing touches on a games section. Check back soon for something to play.
        </p>
      </div>
    </div>
  );
}