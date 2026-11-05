import React, { useEffect, useState } from "react";
import { Flag, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/sk-image";
import { usersByIds } from "@/lib/users";
import { toast } from "@/components/ui/use-toast";

const FB = "#1877f2";
const REASONS = [
  { key: "spam", label: "Spam" },
  { key: "abuse", label: "Abuse or harassment" },
  { key: "other", label: "Something else" },
];

// Report a user for spam or abuse. Saves a report the operator can review in
// the app, and emails it to the app owner through the reportAbuse function.
export default function ReportDialog({ me, peer = null, conversation = null, onClose }) {
  const [target, setTarget] = useState(peer);
  const [peers, setPeers] = useState([]);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (peer || !me?.id) return;
    let active = true;
    (async () => {
      const res = await base44.entities.Conversation
        .filter({}, { limit: 200, sort: "-last_message_at" })
        .catch(() => ({ items: [] }));
      const ids = new Set();
      (res.items || [])
        .filter((c) => c.member_ids?.includes(me.id) && !c.is_group)
        .forEach((c) => c.member_ids.forEach((id) => id !== me.id && ids.add(id)));
      const map = ids.size ? await usersByIds([...ids]).catch(() => ({})) : {};
      if (active) setPeers(Object.values(map).filter((p) => p?.id));
    })();
    return () => { active = false; };
  }, [me?.id, peer]);

  async function submit() {
    if (!target?.id) {
      toast({ title: "Choose who you're reporting" });
      return;
    }
    setSending(true);
    try {
      const report = await base44.entities.Report.create({
        reporter_id: me.id,
        reporter_name: me.full_name || "",
        reporter_email: me.email || "",
        target_user_id: target.id,
        target_user_name: target.full_name || "",
        conversation_id: conversation?.id || "",
        category: reason,
        details: details.trim(),
      });
      await base44.functions.invoke("reportAbuse", { reportId: report.id }).catch(() => null);
      setSent(true);
    } catch (e) {
      toast({ title: "Could not send report", description: String(e.message || e) });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert size={17} style={{ color: FB }} /> Report spam or abuse
          </h3>
          <button onClick={onClose} className="text-gray-400 text-sm">Close</button>
        </div>

        {sent ? (
          <div className="p-6 text-center space-y-3">
            <p className="font-semibold text-gray-900">Report sent</p>
            <p className="text-sm text-gray-600">
              Thanks for letting us know. Your report goes straight to the Social Kingdom team.
            </p>
            <button onClick={onClose} className="mt-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ background: FB }}>
              Done
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Who */}
            {target ? (
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                  {target.avatar_url ? (
                    <Image src={target.avatar_url} fittingType="fill" className="w-full h-full" />
                  ) : (
                    (target.full_name || "?").charAt(0)
                  )}
                </span>
                <span className="flex-1 text-sm font-semibold text-gray-900 truncate">
                  {target.full_name || "User"}
                </span>
                {!peer && (
                  <button onClick={() => setTarget(null)} className="text-xs font-semibold" style={{ color: FB }}>
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Who are you reporting?</p>
                {peers.length === 0 ? (
                  <p className="text-xs text-gray-400">You have no recent chats to report.</p>
                ) : (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto">
                    {peers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setTarget(p)}
                        className="w-full flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-2 text-left"
                      >
                        <span className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                          {p.avatar_url ? (
                            <Image src={p.avatar_url} fittingType="fill" className="w-full h-full" />
                          ) : (
                            (p.full_name || "?").charAt(0)
                          )}
                        </span>
                        <span className="text-sm text-gray-800 truncate">{p.full_name || "User"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">What happened?</p>
              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => {
                  const on = reason === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => setReason(r.key)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                      style={on ? { background: FB, borderColor: FB, color: "#fff" } : { borderColor: "#d1d5db", color: "#374151" }}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Add any details that will help us review this (optional)…"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none resize-none text-gray-900"
            />

            <button
              onClick={submit}
              disabled={sending}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: FB }}
            >
              <Flag size={15} /> {sending ? "Sending…" : "Send report"}
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              Reports are private and go only to the Social Kingdom team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}