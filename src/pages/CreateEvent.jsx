import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, X, Globe, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES } from "@/lib/categories";
import { makeEventIcon } from "@/lib/mapMarker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import InvitePicker from "@/components/invite/InvitePicker";

const WALLA_WALLA = [46.0646, -118.3425];
const FB = "#1877f2";

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) });
  return null;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const clickId = params.get("click_id") || "";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("sports");
  const [ageBracket, setAgeBracket] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [position, setPosition] = useState(null);
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState(
    params.get("visibility") === "personal" ? "personal" : "public"
  );
  const [me, setMe] = useState(null);
  const [inviteSelection, setInviteSelection] = useState({ users: [], clicks: [], events: [] });

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, []);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function submit() {
    if (!title.trim()) {
      toast({ title: "Add a title for your gathering" });
      return;
    }
    if (!position) {
      toast({ title: "Tap the map to set a location" });
      return;
    }
    setSaving(true);
    try {
      const ev = await base44.entities.Event.create({
        title: title.trim(),
        description: description.trim(),
        category,
        latitude: position.lat,
        longitude: position.lng,
        age_bracket: ageBracket.trim(),
        dress_code: dressCode.trim(),
        tags,
        start_time: new Date().toISOString(),
        address: "",
        visibility,
        click_id: clickId
      });
      await sendInvites(ev);
      navigate(clickId ? `/clicks/${clickId}` : `/event/${ev.id}`);
    } catch (e) {
      toast({ title: "Could not save gathering", description: String(e.message || e) });
    } finally {
      setSaving(false);
    }
  }

  async function sendInvites(ev) {
    if (!me) return;
    const invited = new Set();
    const inviteUser = async (uid, uname) => {
      if (!uid || invited.has(uid) || uid === me.id) return;
      invited.add(uid);
      await base44.entities.Invite.create({
        target_type: "event",
        target_id: ev.id,
        target_name: ev.title,
        target_image: ev.image_url || "",
        target_category: ev.category,
        target_address: ev.address || "",
        inviter_id: me.id,
        inviter_name: me.full_name || "",
        invitee_id: uid,
        invitee_name: uname || ""
      }).catch(() => {});
    };
    for (const u of inviteSelection.users) await inviteUser(u.id, u.name);
    for (const c of inviteSelection.clicks) {
      const mem = await base44.entities.ClickMembership
        .filter({ click_id: c.id }, { limit: 200 })
        .catch(() => ({ items: [] }));
      for (const m of mem.items) await inviteUser(m.user_id, m.user_name);
    }
    for (const e of inviteSelection.events) {
      const att = await base44.entities.Attendance
        .filter({ event_id: e.id }, { limit: 200 })
        .catch(() => ({ items: [] }));
      for (const a of att.items) await inviteUser(a.user_id, a.user_name);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <button onClick={() => navigate(clickId ? `/clicks/${clickId}` : "/")} aria-label="Back">
          <ArrowLeft size={22} color="#000000" />
        </button>
        <h1 className="text-xl font-bold">{clickId ? "Host a CliQ Event" : "Create a Gathering"}</h1>
      </div>

      <div className="p-4 space-y-5">
        <div>
          <label className="text-sm font-semibold text-gray-700">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Walla Walla Hoops"
            className="mt-1.5"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this gathering about?"
            className="mt-1.5"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Category</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {CATEGORIES.map((c) => {
              const on = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition"
                  style={{
                    background: on ? c.color : "#ffffff",
                    color: on ? "#ffffff" : "#374151",
                    borderColor: on ? c.color : "#e5e7eb"
                  }}
                >
                  <span>{c.emoji}</span> {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Visibility</label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold border transition"
              style={{
                background: visibility === "public" ? FB : "#ffffff",
                color: visibility === "public" ? "#ffffff" : "#374151",
                borderColor: visibility === "public" ? FB : "#e5e7eb"
              }}
            >
              <Globe size={16} /> Public
            </button>
            <button
              type="button"
              onClick={() => setVisibility("personal")}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold border transition"
              style={{
                background: visibility === "personal" ? FB : "#ffffff",
                color: visibility === "personal" ? "#ffffff" : "#374151",
                borderColor: visibility === "personal" ? FB : "#e5e7eb"
              }}
            >
              <Lock size={16} /> Personal
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {visibility === "public"
              ? "Anyone on the map can discover this gathering."
              : "Only shared with your CliQ — not shown on the public map."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">Age Bracket</label>
            <Input
              value={ageBracket}
              onChange={(e) => setAgeBracket(e.target.value)}
              placeholder="e.g. 18+"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Dress Code</label>
            <Input
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              placeholder="e.g. Casual"
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Custom Criteria Tags</label>
          <div className="flex gap-2 mt-1.5">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type a tag and press Enter"
            />
            <Button type="button" onClick={addTag} variant="outline" className="shrink-0">
              <Plus size={16} />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                  style={{ background: FB }}
                >
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                    <X size={12} color="#ffffff" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Location</label>
          <div className="rounded-2xl overflow-hidden border border-blue-200 mt-1.5 h-64">
            <MapContainer
              center={WALLA_WALLA}
              zoom={13}
              zoomControl={false}
              attributionControl={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                className="meetme-tiles"
                maxZoom={19}
              />
              <ClickHandler onPick={setPosition} />
              {position && (
                <Marker position={[position.lat, position.lng]} icon={makeEventIcon(category)} />
              )}
            </MapContainer>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {position
              ? `Pinned at ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
              : "Tap the map to set the gathering location."}
          </p>
        </div>

        <InvitePicker onChange={setInviteSelection} />

        <Button
          onClick={submit}
          disabled={saving}
          className="w-full text-white font-semibold py-3 text-base"
          style={{ background: FB }}
        >
          {saving ? "Posting…" : "Post Gathering"}
        </Button>
      </div>

    </div>
  );
}