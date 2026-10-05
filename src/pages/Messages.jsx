import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";

const FB = "#1877f2";

export default function Messages() {
  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <Link to="/profile" aria-label="Back">
          <ArrowLeft size={22} color="#ffffff" />
        </Link>
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: FB + "18" }}>
          <MessageCircle size={30} color={FB} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mt-3">Your CliQ chats live here</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
          Direct messages and CliQ group chats are coming soon. Invite friends to a CliQ to start gathering.
        </p>
        <Link
          to="/clicks"
          className="inline-block mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: FB }}
        >
          Go to CliQ's
        </Link>
      </div>
    </div>
  );
}