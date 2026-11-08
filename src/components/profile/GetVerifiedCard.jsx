import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import SelfieCapture from "@/components/auth/SelfieCapture";
import { markVerified } from "@/lib/verified";

/* Shown on your own profile while you are not verified. Turning the switch on
   opens the selfie check; passing it saves "verified" on the account and the
   badge then follows your name everywhere in the app. */
export default function GetVerifiedCard({ me, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!me || me.selfie_verified) return null;

  async function handleSelfie(fileUri) {
    setSaving(true);
    setError("");
    try {
      const updated = await base44.auth.updateMe({ selfie_verified: true, selfie_uri: fileUri });
      const next = { ...me, selfie_verified: true, ...(updated || {}) };
      markVerified(next);
      onUpdated?.(next);
      setOpen(false);
    } catch {
      setError("We couldn't save your verification. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex items-center gap-3">
      <span className="w-10 h-10 rounded-full bg-[#e7f0fe] flex items-center justify-center shrink-0">
        <ShieldCheck size={20} color="#1877f2" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Get Verified</p>
        <p className="text-[11px] text-gray-500 leading-tight">
          Take a selfie to earn a verified badge next to your name.
        </p>
      </div>
      <Switch checked={false} onCheckedChange={() => setOpen(true)} aria-label="Get verified" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Get verified</DialogTitle>
          <SelfieCapture
            title={saving ? "Saving your verification…" : "Get verified"}
            subtitle="A quick selfie proves you're a real person and earns your verified badge. It stays private on your account."
            onCaptured={handleSelfie}
          />
          {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
}