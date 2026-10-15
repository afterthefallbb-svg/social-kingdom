import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Calendar, MapPin, UserPlus, Flag, Camera, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import KloutButton from "@/components/klout/KloutButton";
import VideoGallery from "@/components/video/VideoGallery";
import ClickPresenceBadge from "@/components/presence/ClickPresenceBadge";

const FB = "#1877f2";

export default function ClickDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [click, setClick] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [me, setMe] = useState(null);
  const [host, setHost] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showOnline, setShowOnline] = useState(true);
  const fileRef = useRef(null);

  async function loadAll() {
    if (!id) return;
    const c = await base44.entities.Click.get(id).catch(() => null);
    setClick(c);
    setShowOnline(c?.show_online !== false);
    const m = await base44.entities.ClickMembership
      .filter({ click_id: id }, { limit: 50 })
      .catch(() => ({ items: [] }));
    setMembers(m.items);
    const e = await base44.entities.Event
      .filter({ click_id: id }, { sort: "start_time", limit: 50 })
      .catch(() => ({ items: [] }));
    setEvents(e.items);
    base44.auth.me().then(setMe).catch(() => setMe(null));
    if (c?.created_by_id) {
      base44.entities.User.get(c.created_by_id).then(setHost).catch(() => setHost(null));
    } else {
      setHost(null);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isHost = !!me?.id && click?.created_by_id === me.id;

  async function inviteFriend() {
    const n = friendName.trim();
    if (!n) {
      toast({ title: "Enter a friend's name" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.ClickMembership.create({
        click_id: id,
        user_id: "invited-" + Date.now(),
        user_name: n
      });
      if (click) {
        await base44.entities.Click.update(id, {
          member_count: (click.member_count || members.length) + 1
        });
      }
      setFriendName("");
      setInviting(false);
      toast({ title: `Invited ${n} to ${click?.name || "this CliQ"}` });
      loadAll();
    } catch (e) {
      toast({ title: "Could not invite", description: String(e.message || e) });
    } finally {
      setSaving(false);
    }
  }

  async function saveShowOnline(val) {
    setSaving(true);
    try {
      const updated = await base44.entities.Click.update(id, { show_online: val });
      setClick(updated);
      toast({ title: val ? "CliQ online status shown" : "CliQ online status hidden" });
    } catch (e) {
      toast({ title: "Could not save", description: String(e.message || e) });
      setShowOnline(!val);
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const updated = await base44.entities.Click.update(id, { avatar_url: file_url });
      setClick(updated);
      toast({ title: "CliQ photo updated" });
    } catch (err) {
      toast({ title: "Upload failed", description: String(err.message || err) });
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <Link to="/clicks" aria-label="Back">
          <ArrowLeft size={22} color="#000000" />
        </Link>
        <h1 className="text-xl font-bold flex-1">CliQ</h1>
      </div>

      {click && (
        <div className="bg-white border-b-4 px-4 py-5 text-center" style={{ borderColor: FB }}>
          <div className="relative w-20 h-20 mx-auto shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden border-4" style={{ borderColor: FB }}>
              {click.avatar_url ? (
                <Image src={click.avatar_url} fittingType="fill" className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: FB }}>
                  {(click.name || "?").charAt(0)}
                </div>
              )}
            </div>
            <ClickPresenceBadge click={click} host={host} className="-top-1 -right-1 text-base" />
            {isHost && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-white shadow border flex items-center justify-center"
                style={{ borderColor: FB, color: FB }}
                aria-label="Edit CliQ photo"
              >
                <Camera size={13} />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarFile} />
          </div>
          {uploadingAvatar && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
          <h2 className="text-xl font-bold text-gray-900 mt-3">{click.name}</h2>
          <p className="text-sm font-semibold mt-1 flex items-center justify-center gap-1" style={{ color: FB }}>
            <Users size={14} /> {click.member_count || members.length} members
          </p>
          <div className="mt-3 flex justify-center">
            <KloutButton target_type="click" target_id={click.id} page={{ page_type: "click", page_id: click.id }} />
          </div>
          {click.description && (
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{click.description}</p>
          )}

          {/* Host */}
          {host && (
            <div className="mt-4 flex items-end gap-3 justify-center">
              <Link to={`/profile/${host.id}`} className="relative shrink-0 pr-7" aria-label={`Host ${host.full_name}`}>
                <div
                  className="w-14 h-14 rounded-full overflow-hidden border-2 bg-blue-100 flex items-center justify-center text-lg font-bold"
                  style={{ borderColor: FB, color: FB }}
                >
                  {host.avatar_url ? (
                    <Image src={host.avatar_url} fittingType="fill" className="w-full h-full" />
                  ) : (
                    (host.full_name || "?").charAt(0).toUpperCase()
                  )}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white shadow border flex items-center justify-center"
                  style={{ borderColor: FB, color: FB }}
                  aria-hidden="true"
                >
                  <Crown size={12} />
                </span>
              </Link>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 text-white"
                    style={{ background: FB }}
                  >
                    Host
                  </span>
                  <span className="font-bold text-gray-900 truncate">{host.full_name}</span>
                </div>
                {host.location && <p className="text-sm text-gray-500 truncate">{host.location}</p>}
              </div>
            </div>
          )}

          {/* Host-only setting: whether this CliQ shows its online status */}
          {isHost && (
            <div className="mt-4 flex items-center justify-between max-w-xs mx-auto bg-gray-50 rounded-lg px-3 py-2">
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-900">Show CliQ online status</p>
                <p className="text-[11px] text-gray-500">Show this CliQ's online dot in messages & profile.</p>
              </div>
              <Switch
                checked={showOnline}
                disabled={saving}
                onCheckedChange={(v) => {
                  setShowOnline(v);
                  saveShowOnline(v);
                }}
              />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setInviting(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white"
              style={{ background: FB }}
            >
              <UserPlus size={15} /> Invite Friends
            </button>
            <button
              onClick={() => navigate(`/create?click_id=${id}&visibility=personal`)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold border"
              style={{ borderColor: FB, color: FB }}
            >
              <Flag size={15} /> Host Event
            </button>
          </div>
        </div>
      )}

      {/* Members — horizontal scroll of circular avatars */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-bold mb-2" style={{ color: FB }}>
          MEMBERS
        </h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {members.length === 0 && <p className="text-sm text-gray-400">No members yet.</p>}
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() =>
                navigate(`/profile/${m.user_id}`, {
                  state: { name: m.user_name, avatar: m.user_avatar, city: m.user_city }
                })
              }
              className="flex flex-col items-center gap-1 shrink-0 w-16"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden border-2" style={{ borderColor: FB }}>
                {m.user_avatar ? (
                  <Image src={m.user_avatar} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold" style={{ color: FB }}>
                    {(m.user_name || "?").charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-gray-600 truncate max-w-[60px]">
                {m.user_name?.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Videos posted to this CliQ */}
      <div className="px-4 mt-6">
        <VideoGallery title="CliQ Videos" scope={{ click_id: id }} />
      </div>

      {/* Upcoming private events for this CliQ */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-bold mb-2" style={{ color: FB }}>
          UPCOMING EVENTS
        </h3>
        <div className="space-y-2">
          {events.length === 0 && (
            <p className="text-sm text-gray-400">No events scheduled yet. Host one for your CliQ.</p>
          )}
          {events.map((ev) => {
            const cat = getCategory(ev.category);
            return (
              <div key={ev.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ background: cat.color + "22" }}
                >
                  {cat.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={11} /> {ev.start_time ? new Date(ev.start_time).toLocaleDateString() : "Soon"}
                    {ev.address && (
                      <>
                        <MapPin size={11} className="ml-1" /> {ev.address}
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite friend dialog */}
      {inviting && (
        <div
          className="fixed inset-0 z-[700] flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setInviting(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900">Invite a Friend</h3>
            <p className="text-sm text-gray-500 mt-0.5">Add a friend to {click?.name}.</p>
            <Input
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Friend's name"
              className="mt-3"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <Button variant="outline" className="flex-1" onClick={() => setInviting(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 text-white"
                style={{ background: FB }}
                disabled={saving}
                onClick={inviteFriend}
              >
                {saving ? "Inviting…" : "Invite"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}