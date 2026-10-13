import React, { useState } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import PhotoUpload from "./PhotoUpload";

const FB = "#1877f2";

const toArray = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function EditProfileDialog({ me, onClose, onSaved }) {
  const [bio, setBio] = useState(me?.bio || "");
  const [location, setLocation] = useState(me?.location || "");
  const [avatar, setAvatar] = useState(me?.avatar_url || "");
  const [cover, setCover] = useState(me?.cover_url || "");
  const [traits, setTraits] = useState((me?.traits || []).join(", "));
  const [hobbies, setHobbies] = useState((me?.hobbies || []).join(", "));
  const [music, setMusic] = useState((me?.music || []).join(", "));
  const [publicProfile, setPublicProfile] = useState(me?.public_profile !== false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  async function save() {
    setSaving(true);
    try {
      const updated = await base44.auth.updateMe({
        bio: bio.trim(),
        location: location.trim(),
        avatar_url: avatar.trim(),
        cover_url: cover.trim(),
        traits: toArray(traits),
        hobbies: toArray(hobbies),
        music: toArray(music),
        public_profile: publicProfile
      });
      onSaved(updated);
      onClose();
      toast({ title: "Profile updated" });
    } catch (e) {
      toast({ title: "Could not save", description: String(e.message || e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[700] flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="font-bold text-gray-900">Edit Profile</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="mt-1.5" placeholder="A short intro about you" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" placeholder="City, State" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Avatar Image URL</label>
            <div className="flex gap-2 mt-1.5">
              <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
              <button type="button" onClick={() => setUploading("avatar")} className="shrink-0 inline-flex items-center gap-1 rounded-md px-3 text-xs font-semibold text-white" style={{ background: FB }}>
                Upload
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Cover Image URL</label>
            <div className="flex gap-2 mt-1.5">
              <Input value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://..." />
              <button type="button" onClick={() => setUploading("cover")} className="shrink-0 inline-flex items-center gap-1 rounded-md px-3 text-xs font-semibold text-white" style={{ background: FB }}>
                Upload
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Personal Traits (comma separated)</label>
            <Input value={traits} onChange={(e) => setTraits(e.target.value)} className="mt-1.5" placeholder="Outgoing, Loyal, Funny" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Hobbies (comma separated)</label>
            <Input value={hobbies} onChange={(e) => setHobbies(e.target.value)} className="mt-1.5" placeholder="Hiking, Gaming, Cooking" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Music (comma separated)</label>
            <Input value={music} onChange={(e) => setMusic(e.target.value)} className="mt-1.5" placeholder="Hip-hop, Jazz, Indie" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700">Public profile</p>
              <p className="text-[11px] text-gray-400">When on, anyone can discover and invite you. Off, only friends and friends-of-friends can invite you.</p>
            </div>
            <button
              type="button"
              onClick={() => setPublicProfile((v) => !v)}
              className="relative w-11 h-6 rounded-full transition"
              style={{ background: publicProfile ? FB : "#cbd5e1" }}
            >
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: publicProfile ? "22px" : "2px" }} />
            </button>
          </div>
          <Button onClick={save} disabled={saving} className="w-full text-white font-semibold" style={{ background: FB }}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
        {uploading && (
          <PhotoUpload
            label={uploading === "avatar" ? "Profile Photo" : "Cover Photo"}
            onUploaded={(url) => {
              if (uploading === "avatar") setAvatar(url);
              else setCover(url);
              setUploading(null);
            }}
            onClose={() => setUploading(null)}
          />
        )}
      </div>
    </div>
  );
}