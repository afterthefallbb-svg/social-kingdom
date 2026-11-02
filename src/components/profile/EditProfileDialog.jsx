import React, { useEffect, useRef, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import CityField from "@/components/profile/CityField";
import AvatarCropDialog from "@/components/profile/AvatarCropDialog";
import BioChips from "@/components/profile/BioChips";
import BioPickerDialog from "@/components/profile/BioPickerDialog";
import PhotoPickIcons from "@/components/profile/PhotoPickIcons";
import { checkProfilePhoto } from "@/lib/faceCheck";

const FB = "#1877f2";

// Every self-describing section picks from the searchable database.
const BIO_FIELDS = [
  { field: "professional_interests", label: "Professional Interests", emoji: "📈" },
  { field: "interests", label: "Interests", emoji: "⭐" },
  { field: "hobbies", label: "Hobbies", emoji: "🎯" },
  { field: "goals", label: "Goals", emoji: "🏆" },
  { field: "music", label: "Music", emoji: "🎵" },
  { field: "family_members", label: "Family Members", emoji: "👪" }
];

async function uploadPublic(file) {
  const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
  return file_url;
}

export default function EditProfileDialog({ me, onClose, onSaved }) {
  const [bio, setBio] = useState(me?.bio || "");
  const [location, setLocation] = useState(me?.location || "");
  const [job, setJob] = useState(me?.job || "");
  const [birthday, setBirthday] = useState(me?.birthday || "");
  const [avatar, setAvatar] = useState(me?.avatar_url || "");
  const [cover, setCover] = useState(me?.cover_url || "");
  const [lists, setLists] = useState(() =>
    Object.fromEntries(BIO_FIELDS.map((f) => [f.field, me?.[f.field] || []]))
  );
  const [browsing, setBrowsing] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(null); // 'avatar' | 'cover' | 'photos'
  const [publicProfile, setPublicProfile] = useState(me?.public_profile !== false);
  const [profileType, setProfileType] = useState(me?.profile_type || "none");
  const [saving, setSaving] = useState(false);
  const [cropFile, setCropFile] = useState(null);

  const avatarLib = useRef(null);
  const avatarCam = useRef(null);
  const coverLib = useRef(null);
  const coverCam = useRef(null);
  const photosLib = useRef(null);
  const photosCam = useRef(null);

  useEffect(() => {
    if (!me?.id) return;
    base44.entities.ProfilePhoto
      .filter({ user_id: me.id, album: "gallery" }, { sort: "-created_date", limit: 100 })
      .then((p) => setPhotos(p.items))
      .catch(() => {});
  }, [me?.id]);

  function pickAvatar(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) setCropFile(f);
  }

  async function pickCover(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy("cover");
    try {
      setCover(await uploadPublic(f));
    } catch (err) {
      toast({ title: "Could not upload that photo", description: String(err.message || err) });
    } finally {
      setBusy(null);
    }
  }

  async function pickPhotos(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || !me?.id) return;
    setBusy("photos");
    try {
      const created = [];
      for (const f of files) {
        const url = await uploadPublic(f);
        const rec = await base44.entities.ProfilePhoto.create({
          user_id: me.id,
          url,
          album: "gallery"
        });
        created.push(rec);
      }
      setPhotos((p) => [...created, ...p]);
      toast({ title: created.length > 1 ? "Photos added to My Photos" : "Photo added to My Photos" });
    } catch (err) {
      toast({ title: "Could not add photos", description: String(err.message || err) });
    } finally {
      setBusy(null);
    }
  }

  async function removePhoto(rec) {
    setPhotos((p) => p.filter((x) => x.id !== rec.id));
    await base44.entities.ProfilePhoto.delete(rec.id).catch(() => {});
  }

  async function save() {
    setSaving(true);
    try {
      const newAvatar = avatar.trim();
      const avatarChanged = newAvatar && newAvatar !== (me?.avatar_url || "");
      if (avatarChanged && me?.selfie_verified) {
        const check = await checkProfilePhoto(newAvatar);
        if (!check.ok) {
          toast({
            title: "That photo isn't you",
            description: "Your profile photo has to show your face and match your verified selfie.",
          });
          return;
        }
      }
      const updated = await base44.auth.updateMe({
        bio: bio.trim(),
        location: location.trim(),
        job: job.trim(),
        birthday: birthday.trim(),
        avatar_url: newAvatar,
        cover_url: cover.trim(),
        ...lists,
        public_profile: publicProfile,
        profile_type: profileType
      });
      // Keep the album history in step with what was just saved.
      if (avatarChanged) {
        await base44.entities.ProfilePhoto.create({ user_id: me.id, url: newAvatar, album: "profile" });
      }
      if (cover.trim() && cover.trim() !== (me?.cover_url || "")) {
        await base44.entities.ProfilePhoto.create({ user_id: me.id, url: cover.trim(), album: "cover" });
      }
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
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto pb-24 sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="font-bold text-gray-900">Edit Profile</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-5">
          {/* Profile picture */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              {avatar ? "Change Profile Photo" : "Add Profile Photo"}
            </label>
            <div className="mt-2 flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-50 border border-gray-200">
                {avatar ? (
                  <Image src={avatar} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: FB }}>
                    {(me?.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <input ref={avatarLib} type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
            <input ref={avatarCam} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickAvatar} />
            <div className="mt-2">
              <PhotoPickIcons
                onLibrary={() => avatarLib.current?.click()}
                onCamera={() => avatarCam.current?.click()}
                disabled={!!busy}
              />
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              {cover ? "Change Cover Photo" : "Add Cover Photo"}
            </label>
            <div className="mt-2 rounded-xl overflow-hidden bg-blue-50 h-24 border border-gray-200">
              {cover && <Image src={cover} fittingType="fill" className="w-full h-full" />}
            </div>
            <input ref={coverLib} type="file" accept="image/*" className="hidden" onChange={pickCover} />
            <input ref={coverCam} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickCover} />
            <div className="mt-2">
              <PhotoPickIcons
                onLibrary={() => coverLib.current?.click()}
                onCamera={() => coverCam.current?.click()}
                busy={busy === "cover"}
                disabled={busy === "photos" || busy === "avatar"}
              />
            </div>
          </div>

          {/* Personal photos */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Add Photos</label>
            <p className="text-[11px] text-gray-400 mb-2">Everything you add here lands in My Photos on your profile.</p>
            <input ref={photosLib} type="file" accept="image/*" multiple className="hidden" onChange={pickPhotos} />
            <input ref={photosCam} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickPhotos} />
            <PhotoPickIcons
              onLibrary={() => photosLib.current?.click()}
              onCamera={() => photosCam.current?.click()}
              busy={busy === "photos"}
              disabled={busy === "cover" || busy === "avatar"}
            />
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {photos.map((p) => (
                  <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image src={p.url} fittingType="fill" className="w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removePhoto(p)}
                      aria-label="Remove photo"
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <Trash2 size={11} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="mt-1.5" placeholder="A short intro about you" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Location</label>
            <div className="mt-1.5">
              <CityField value={location} onChange={setLocation} placeholder="City, State" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">Birthday</label>
              <Input value={birthday} onChange={(e) => setBirthday(e.target.value)} className="mt-1.5" placeholder="MM/DD/YYYY" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Job</label>
              <Input value={job} onChange={(e) => setJob(e.target.value)} className="mt-1.5" placeholder="Barista at ..." />
            </div>
          </div>

          {BIO_FIELDS.map((f) => (
            <div key={f.field}>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  <span className="mr-1.5">{f.emoji}</span>{f.label}
                </label>
                <button
                  type="button"
                  onClick={() => setBrowsing(f)}
                  className="text-xs font-semibold"
                  style={{ color: FB }}
                >
                  {lists[f.field].length ? "Change" : "Browse list"}
                </button>
              </div>
              <div className="mt-1.5">
                {lists[f.field].length ? (
                  <BioChips
                    items={lists[f.field]}
                    onRemove={(item) =>
                      setLists((l) => ({ ...l, [f.field]: l[f.field].filter((v) => v !== item) }))
                    }
                  />
                ) : (
                  <p className="text-[11px] text-gray-400">
                    Pick from the {f.label.toLowerCase()} list instead of typing.
                  </p>
                )}
              </div>
            </div>
          ))}
          <div>
            <label className="text-sm font-semibold text-gray-700">Profile type</label>
            <p className="text-[11px] text-gray-400 mb-1.5">Show a badge on your profile and let people find you by type.</p>
            <div className="flex gap-2">
              {[
                { id: "none", label: "Standard" },
                { id: "artist", label: "🎨 Artist" },
                { id: "content_creator", label: "🎬 Content Creator" }
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setProfileType(o.id)}
                  className="flex-1 rounded-lg py-2 text-xs font-semibold border"
                  style={profileType === o.id ? { background: FB, color: "#fff", borderColor: FB } : { borderColor: "#e5e7eb", color: "#374151" }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-700">Public profile</p>
              <p className="text-[11px] text-gray-400">When on, anyone can discover and invite you. Off, only friends and friends-of-friends can invite you.</p>
            </div>
            <button
              type="button"
              onClick={() => setPublicProfile((v) => !v)}
              className="relative w-11 h-6 rounded-full transition shrink-0"
              style={{ background: publicProfile ? FB : "#cbd5e1" }}
            >
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: publicProfile ? "22px" : "2px" }} />
            </button>
          </div>
          <Button onClick={save} disabled={saving} className="w-full text-white font-semibold" style={{ background: FB }}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
        {browsing && (
          <BioPickerDialog
            field={browsing.field}
            label={browsing.label}
            value={lists[browsing.field]}
            onSave={(next) => setLists((l) => ({ ...l, [browsing.field]: next }))}
            onClose={() => setBrowsing(null)}
          />
        )}
        {cropFile && (
          <AvatarCropDialog
            file={cropFile}
            onCropped={(url) => {
              setAvatar(url);
              setCropFile(null);
            }}
            onClose={() => setCropFile(null)}
          />
        )}
      </div>
    </div>
  );
}