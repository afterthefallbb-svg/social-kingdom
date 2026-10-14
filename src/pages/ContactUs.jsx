import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Mail } from "lucide-react";

const FB = "#1877f2";
const EMAIL = "afterthefallbb@gmail.com";

export default function ContactUs() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Feedback</span>
      </div>

      <div className="px-4 mt-6">
        <p className="text-sm text-gray-600 mb-5">
          We'd love to hear from you. Send us an email and we'll get back to you as soon as we can.
        </p>
        <a
          href={`mailto:${EMAIL}`}
          className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4"
        >
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: FB }}>
            <Mail size={20} color="#fff" />
          </span>
          <span className="text-sm font-semibold text-gray-800 break-all">{EMAIL}</span>
        </a>
      </div>
    </div>
  );
}