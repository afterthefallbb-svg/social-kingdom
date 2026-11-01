import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Trash2 } from "lucide-react";

const DANGER = "#dc2626";

// Permanently deletes the signed-in user's own account, then signs them out.
export default function DeleteAccountDialog({ userId, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!userId || busy) return;
    setBusy(true);
    setError("");
    try {
      await base44.entities.User.delete(userId);
      await base44.auth.logout(window.location.origin + "/login");
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Could not delete your account."
      );
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[900] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 text-center">
          <div
            className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
            style={{ background: "#fee2e2" }}
          >
            <Trash2 size={22} style={{ color: DANGER }} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mt-3">Delete my account</h2>
        </div>

        <div className="px-5 py-3 text-sm text-gray-700 leading-relaxed text-center">
          <p>This permanently deletes your profile and account. It cannot be undone.</p>
          {error && (
            <p className="mt-2 text-xs font-semibold" style={{ color: DANGER }}>
              {error}
            </p>
          )}
        </div>

        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-2">
          <button
            onClick={handleDelete}
            disabled={busy}
            className="w-full rounded-xl py-3 text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: DANGER }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {busy ? "Deleting…" : "Delete permanently"}
          </button>
          <button
            onClick={onClose}
            disabled={busy}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-gray-600 bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}