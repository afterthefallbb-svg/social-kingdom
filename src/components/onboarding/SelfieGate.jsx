import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { seedLocalEventsForUser } from "@/lib/localSeed";
import SelfieCapture from "@/components/auth/SelfieCapture";

/* The only thing between an account and the app: a verified selfie. There is no
   tour and no welcome popup any more. Populating the map for a brand-new account
   in an area that has no events yet happens silently here as well. */
export default function SelfieGate() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!alive || !user) return;
      setMe(user);

      const seedKey = `seed_run_v3_${user.id}`;
      if (sessionStorage.getItem(seedKey)) return;
      sessionStorage.setItem(seedKey, "1");
      if (user.sk_onboarded) return;
      const res = await seedLocalEventsForUser();
      if (alive && res?.seeded) {
        window.dispatchEvent(new CustomEvent("sk:area_seeded", { detail: { firstInArea: true } }));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function onSelfie(fileUri) {
    setSaving(true);
    setError("");
    try {
      const updated = await base44.auth.updateMe({ selfie_uri: fileUri, selfie_verified: true });
      setMe(updated);
    } catch {
      setError("We couldn't save your verification. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!me || me.selfie_verified) return null;

  return (
    <div className="fixed inset-0 z-[700] bg-background overflow-y-auto">
      <div className="min-h-full flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <SelfieCapture
            onCaptured={onSelfie}
            title={saving ? "Saving your verification…" : "Verify with a selfie"}
            subtitle="A one-time selfie proves you're a real person. It stays private on your account and is never shown to anyone."
          />
          {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Selfie verification is required — your profile can't be completed without it.
          </p>
        </div>
      </div>
    </div>
  );
}