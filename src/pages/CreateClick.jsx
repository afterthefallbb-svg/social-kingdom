import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";

const FB = "#1877f2";

export default function CreateClick() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showOnline, setShowOnline] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => {
        setMe(u);
        setAvatarUrl(u?.avatar_url || "");
      })
      .catch(() => {});
  }, []);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setAvatarUrl(file_url);
    } catch (err) {
      toast({ title: "Upload failed", description: String(err.message || err) });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function create() {
    if (!name.trim()) {
      toast({ title: "Give your CliQ a name" });
      return;
    }
    setSaving(true);
    try {
      const click = await base44.entities.Click.create({
        name: name.trim(),
        description: description.trim(),
        avatar_url: avatarUrl || me?.avatar_url || "",
        show_online: showOnline,
        member_count: 1
      });
      await base44.entities.ClickMembership.create({
        click_id: click.id,
        user_id: me.id,
        user_name: me.full_name,
        user_avatar: me.avatar_url
      });
      toast({ title: "CliQ created" });
      navigate(`/clicks/${click.id}`, { replace: true });
    } catch (e) {
      toast({ title: "Could not create CliQ", description: String(e.message || e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} color="#fff" />
        </button>
        <h1 className="text-xl font-bold flex-1">Create a CliQ</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Photo — defaults to your profile photo */}
        <div className="bg-white rounded-2xl p-4 text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden border-4" style={{ borderColor: FB }}>
              {avatarUrl ? (
                <Image src={avatarUrl} fittingType="fill" className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: FB }}>
                  {(name || "?").charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-white shadow border flex items-center justify-center"
              style={{ borderColor: FB, color: FB }}
              aria-label="Change CliQ photo"
            >
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {uploading ? "Uploading…" : "Defaults to your profile photo"}
          </p>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500">CliQ NAME</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Walla Walla Hikers"
              className="mt-1"
              maxLength={60}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">DESCRIPTION</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this CliQ about?"
              className="mt-1"
              rows={3}
              maxLength={280}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Show CliQ online status</p>
              <p className="text-xs text-gray-500">Show this CliQ's online dot in messages & profile.</p>
            </div>
            <Switch checked={showOnline} onCheckedChange={setShowOnline} />
          </div>
        </div>

        <Button
          className="w-full text-white"
          style={{ background: FB }}
          disabled={saving || uploading || !me}
          onClick={create}
        >
          {saving ? "Creating…" : "Create CliQ"}
        </Button>
      </div>
    </div>
  );
}