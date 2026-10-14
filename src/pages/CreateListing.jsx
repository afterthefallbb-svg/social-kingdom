import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Image as ImageIcon, Video as VideoIcon, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PhotoEditor from "@/components/compose/PhotoEditor";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplaceCategories";

const FB = "#1877f2";
const CONDITIONS = [
  { id: "new", label: "New" },
  { id: "like_new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" }
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("electronics");
  const [condition, setCondition] = useState("good");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const uploadFiles = async (files, kind) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const f of Array.from(files)) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: f });
        urls.push(file_url);
      }
      if (kind === "image") setImageUrls((prev) => [...prev, ...urls]);
      if (kind === "video") setVideoUrl(urls[urls.length - 1]);
      toast({ title: "Upload complete" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Add a title", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      await base44.entities.Listing.create({
        title: title.trim(),
        price: Number(price) || 0,
        category,
        condition,
        description: description.trim(),
        image_url: imageUrls[0] || "",
        image_urls: imageUrls,
        video_url: videoUrl,
        seller_id: me?.id || "",
        seller_name: me?.full_name || "",
        seller_avatar: me?.avatar_url || ""
      });
      toast({ title: "Listing posted" });
      navigate("/buy-sell");
    } catch (err) {
      toast({ title: err.message || "Could not post", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/buy-sell")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Sell an item</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <form onSubmit={submit} className="px-4 mt-5 space-y-4 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you selling?" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm"
            >
              {CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm"
          >
            {MARKETPLACE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your item" />
        </div>

        <div className="space-y-2">
          <Label>Photos</Label>
          <button
            type="button"
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-300 w-full"
          >
            <ImageIcon size={18} style={{ color: FB }} />
            <span className="text-sm text-gray-600">Add photos (stored publicly — anyone with the link can open them)</span>
          </button>
          {imageUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {imageUrls.map((u, i) => (
                <img key={i} src={u} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              ))}
            </div>
          )}
          {showEditor && (
            <PhotoEditor
              label="Listing Photo"
              aspect="1 / 1"
              onUploaded={(url) => { setImageUrls((prev) => [...prev, url]); toast({ title: "Photo added" }); }}
              onClose={() => setShowEditor(false)}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>Video</Label>
          <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-300">
            <VideoIcon size={18} style={{ color: FB }} />
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste a video link"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <label className="flex items-center gap-2 p-2 text-sm text-gray-600 cursor-pointer">
            <span>…or upload a video</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => uploadFiles(e.target.files, "video")} />
          </label>
        </div>

        <Button type="submit" disabled={saving || uploading} className="w-full h-12 text-white" style={{ background: FB }}>
          {saving || uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {saving ? "Posting…" : uploading ? "Uploading…" : "Post listing"}
        </Button>
      </form>
    </div>
  );
}