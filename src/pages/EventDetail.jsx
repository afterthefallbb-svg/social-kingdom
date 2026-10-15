import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Globe, Lock, UserPlus, Camera, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import EventDirectionsLink from "@/components/event/EventDirectionsLink";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import EventAttending from "@/components/event/EventAttending";
import EventPhotos from "@/components/event/EventPhotos";
import EventPosts from "@/components/event/EventPosts";
import VideoGallery from "@/components/video/VideoGallery";
import KloutButton from "@/components/klout/KloutButton";
import InviteDialog from "@/components/invite/InviteDialog";
import PhotoEditor from "@/components/compose/PhotoEditor";

const FB = "#1877f2";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [click, setClick] = useState(null);
  const [me, setMe] = useState(null);
  const [attending, setAttending] = useState(false);
  const [myAttendanceId, setMyAttendanceId] = useState(null);
  const [attendingVersion, setAttendingVersion] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [host, setHost] = useState(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    base44.entities.Event.get(id).then(setEvent).catch(() => setEvent(null));
  }, [id]);

  useEffect(() => {
    if (event?.click_id) {
      base44.entities.Click.get(event.click_id).then(setClick).catch(() => setClick(null));
    } else {
      setClick(null);
    }
  }, [event]);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!event?.created_by_id) {
      setHost(null);
      return;
    }
    base44.entities.User.get(event.created_by_id).then(setHost).catch(() => setHost(null));
  }, [event]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!me || !event) return;
      const a = await base44.entities.Attendance
        .filter({ event_id: event.id, user_id: me.id }, { limit: 1 })
        .catch(() => ({ items: [] }));
      if (active) {
        setAttending(a.items.length > 0);
        setMyAttendanceId(a.items[0]?.id || null);
      }
    })();
    return () => {
      active = false;
    };
  }, [me, event]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  const cat = getCategory(event.category);
  const isPersonal = event.visibility === "personal";
  const isCreator = event.created_by_id === me?.id;

  async function removeAttendance() {
    if (!myAttendanceId) return;
    try {
      await base44.entities.Attendance.delete(myAttendanceId);
      setAttending(false);
      setMyAttendanceId(null);
      setAttendingVersion((v) => v + 1);
      toast({ title: "You're no longer attending" });
    } catch (e) {
      toast({ title: "Could not remove", description: String(e.message || e) });
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="bg-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft size={20} className="text-black" />
          </button>
          <h1 className="font-bold text-gray-900 truncate">Event</h1>
        </div>

        <div
          className="h-40 relative flex items-center justify-center text-7xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}
        >
          {event.image_url ? (
            <Image src={event.image_url} fittingType="fill" className="absolute inset-0 w-full h-full" />
          ) : (
            cat.emoji
          )}
          {isCreator && !event.image_url && (
            <button
              onClick={() => setUploadingMain(true)}
              className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow"
              aria-label="Upload event photo"
            >
              <Camera size={18} color={FB} />
            </button>
          )}
        </div>
        {uploadingMain && (
          <PhotoEditor
            label="Event Photo"
            aspect="16 / 9"
            onUploaded={async (url) => {
              setUploadingMain(false);
              try {
                const updated = await base44.entities.Event.update(event.id, { image_url: url });
                setEvent(updated);
                toast({ title: "Event photo updated" });
              } catch (e) {
                toast({ title: "Could not save", description: String(e.message || e) });
              }
            }}
            onClose={() => setUploadingMain(false)}
          />
        )}

        <div className="p-4">
          {host && (
            <div className="flex items-end gap-3 mb-4">
              <Link
                to={`/profile/${host.id}`}
                state={{ name: host.full_name, avatar: host.avatar_url, city: host.location }}
                className="relative shrink-0 pr-7"
                aria-label={`Host ${host.full_name}`}
              >
                <div
                  className="w-16 h-16 rounded-full overflow-hidden border-2 bg-blue-100 flex items-center justify-center text-xl font-bold"
                  style={{ borderColor: FB, color: FB }}
                >
                  {host.avatar_url ? (
                    <Image src={host.avatar_url} fittingType="fill" className="w-full h-full" />
                  ) : (
                    (host.full_name || "?").charAt(0).toUpperCase()
                  )}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card shadow flex items-center justify-center text-base border"
                  style={{ borderColor: cat.color }}
                  aria-hidden="true"
                >
                  {cat.emoji}
                </span>
              </Link>
              <div className="min-w-0">
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

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: cat.color }}>
              {cat.label}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: isPersonal ? "#64748b" : FB }}
            >
              {isPersonal ? <><Lock size={10} /> Private</> : <><Globe size={10} /> Public</>}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          {event.address && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin size={14} /> {event.address}
            </div>
          )}

          <div className="mt-2">
            <KloutButton target_type="event" target_id={event.id} page={{ page_type: "event", page_id: event.id }} />
          </div>

          {click && (
            <Link
              to={`/clicks/${click.id}`}
              className="inline-flex items-center gap-2 mt-2 text-sm font-semibold"
              style={{ color: FB }}
            >
              <span
                className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-bold"
                style={{ color: FB }}
              >
                {click.avatar_url ? (
                  <Image src={click.avatar_url} fittingType="fill" className="w-full h-full" />
                ) : (
                  (click.name || "?").charAt(0)
                )}
              </span>
              Hosted by {click.name}
            </Link>
          )}

          {event.description && <p className="text-sm text-gray-600 mt-3">{event.description}</p>}

          <EventDirectionsLink event={event} className="mt-4 py-3" />

          <button
            onClick={() => {
              const canInvite = event.created_by_id === me?.id || attending;
              if (canInvite) {
                setInviteOpen(true);
              } else {
                toast({ title: "You must first be attending the event before you can invite someone." });
              }
            }}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border"
            style={{ borderColor: FB, color: FB }}
          >
            <UserPlus size={16} /> Invite
          </button>

          {attending && !isCreator && (
            <button
              onClick={removeAttendance}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border"
              style={{ borderColor: "#e11d48", color: "#e11d28" }}
            >
              Remove attendance
            </button>
          )}

          {isCreator && (
            <button
              onClick={async () => {
                if (!window.confirm("Delete this event permanently? This cannot be undone.")) return;
                try {
                  await base44.entities.Event.delete(event.id);
                  toast({ title: "Event deleted" });
                  navigate("/browse");
                } catch (e) {
                  toast({ title: "Could not delete", description: String(e.message || e) });
                }
              }}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border"
              style={{ borderColor: "#e11d48", color: "#e11d28" }}
            >
              <Trash2 size={16} /> Delete event
            </button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-3 max-w-2xl mx-auto">
        <EventAttending eventId={event.id} hostId={event.created_by_id} refreshKey={attendingVersion} />
        <EventPhotos eventId={event.id} />
        <VideoGallery title="Event Videos" scope={{ event_id: event.id }} />
        <EventPosts eventId={event.id} />
      </div>

      {inviteOpen && <InviteDialog event={event} onClose={() => setInviteOpen(false)} />}
    </div>
  );
}