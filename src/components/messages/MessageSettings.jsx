import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/sk-image";
import { Switch } from "@/components/ui/switch";
import GlassToggle from "@/components/theme/GlassToggle";
import ReportDialog from "@/components/messages/ReportDialog";
import { Flag } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const FB = "#1877f2";
const EMOJIS = ["👑", "🟢", "🟡", "🔴", "😎", "🏆", "⭐", "💬", "👻", "🎯", "🔥", "✅", "🤡"];

export default function MessageSettings({ me, onClose, onSaved }) {
  const [showOnline, setShowOnline] = useState(me?.show_online !== false);
  const [emoji, setEmoji] = useState(me?.status_emoji || "👑");
  const [bubbles, setBubbles] = useState(me?.bubbles_enabled !== false);
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!me?.id) return;
    base44.entities.Block.filter({ blocker_id: me.id }, { limit: 100 })
      .then((r) => setBlocks(r.items || []))
      .catch(() => setBlocks([]));
  }, [me?.id]);

  async function save() {
    setSaving(true);
    try {
      const updated = await base44.auth.updateMe({
        show_online: showOnline,
        status_emoji: emoji,
        bubbles_enabled: bubbles,
      });
      onSaved?.(updated);
      toast({ title: "Settings saved" });
      onClose();
    } catch (e) {
      toast({ title: "Could not save", description: String(e.message || e) });
    } finally {
      setSaving(false);
    }
  }

  async function unblock(id) {
    await base44.entities.Block.delete(id).catch(() => {});
    setBlocks((b) => b.filter((x) => x.id !== id));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Message Settings</h3>
          <button onClick={onClose} className="text-gray-400 text-sm">Close</button>
        </div>

        <div className="p-4 space-y-5">
          {/* Online visibility */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Show online status</p>
              <p className="text-xs text-gray-500">Others can see when you're active.</p>
            </div>
            <Switch
              checked={showOnline}
              onCheckedChange={setShowOnline}
              className="sk-glass-switch"
            />
          </div>

          {/* Chat bubbles */}
          <div className="flex items-center justify-between">
            <div className="pr-3">
              <p className="font-semibold text-gray-900 text-sm">Chat bubbles</p>
              <p className="text-xs text-gray-500">
                Keep a chat as a floating bubble with their photo when you close the window. Tap it to reopen.
              </p>
            </div>
            <Switch
              checked={bubbles}
              onCheckedChange={setBubbles}
              className="sk-glass-switch"
            />
          </div>

          {/* Status emoji */}
          <div>
            <p className="font-semibold text-gray-900 text-sm mb-2">Online status emoji</p>
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map((e) => (
                <GlassToggle
                  key={e}
                  selected={emoji === e}
                  onClick={() => setEmoji(e)}
                  className="w-10 h-10 rounded-full text-xl"
                >
                  {e}
                </GlassToggle>
              ))}
            </div>
          </div>

          {/* Blocked users */}
          <div>
            <p className="font-semibold text-gray-900 text-sm mb-2">Blocked users</p>
            {blocks.length === 0 ? (
              <p className="text-xs text-gray-400">You haven't blocked anyone.</p>
            ) : (
              <div className="space-y-2">
                {blocks.map((b) => (
                  <div key={b.id} className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {(b.blocked_name || "?").charAt(0)}
                    </span>
                    <span className="flex-1 text-sm text-gray-700 truncate">{b.blocked_name || "User"}</span>
                    <button onClick={() => unblock(b.id)} className="text-xs font-semibold" style={{ color: FB }}>Unblock</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report spam or abuse */}
          <div>
            <p className="font-semibold text-gray-900 text-sm mb-2">Report spam or abuse</p>
            <p className="text-xs text-gray-500 mb-2">Send a private report straight to the Social Kingdom team.</p>
            <button
              onClick={() => setReportOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold"
              style={{ borderColor: "#d1d5db", color: "#b91c1c" }}
            >
              <Flag size={15} /> Report a user
            </button>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white"
            style={{ background: FB }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {reportOpen && <ReportDialog me={me} onClose={() => setReportOpen(false)} />}
    </div>
  );
}