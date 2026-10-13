import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { GROUP_CATEGORIES, getCategory } from "@/lib/groupCategories";

const FB = "#1877f2";

export default function CreateGroup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(params.get("category") || GROUP_CATEGORIES[0].id);
  const [subcategory, setSubcategory] = useState(params.get("sub") || "");
  const [location, setLocation] = useState("");
  const [headerImage, setHeaderImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const cat = getCategory(category);

  async function uploadFile(file) {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setHeaderImage(file_url);
      toast({ title: "Header uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Add a group name", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      await base44.entities.Group.create({
        name: name.trim(),
        description: description.trim(),
        category,
        category_label: cat.label,
        subcategory: subcategory,
        header_image: headerImage,
        location: location.trim(),
        creator_id: me?.id || "",
        creator_name: me?.full_name || "",
        member_count: 1
      });
      toast({ title: "Group created" });
      navigate(`/groups/${category}${subcategory ? `?sub=${encodeURIComponent(subcategory)}` : ""}`);
    } catch (err) {
      toast({ title: err.message || "Could not create", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Create Group</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <form onSubmit={submit} className="px-4 mt-5 space-y-4 max-w-xl">
        <div className="space-y-2">
          <Label>Group name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Walla Walla Hoops" />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
            className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm"
          >
            {GROUP_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Subcategory</Label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">— Select —</option>
            {getCategory(category).subs.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this group about?" />
        </div>

        <div className="space-y-2">
          <Label>Header photo</Label>
          <label className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-300 cursor-pointer">
            <ImageIcon size={18} style={{ color: FB }} />
            <span className="text-sm text-gray-600">Upload header (stored publicly — anyone with the link can open them)</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadFile(e.target.files?.[0])} />
          </label>
          {headerImage && <img src={headerImage} alt="" className="w-full h-28 rounded-lg object-cover" />}
        </div>

        <Button type="submit" disabled={saving || uploading} className="w-full h-12 text-white" style={{ background: FB }}>
          {saving || uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {saving ? "Creating…" : uploading ? "Uploading…" : "Create Group"}
        </Button>
      </form>
    </div>
  );
}