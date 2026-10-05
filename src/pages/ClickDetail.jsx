import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Calendar, MapPin, UserPlus, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getCategory } from "@/lib/categories";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const FB = "#1877f2";

export default function ClickDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [click, setClick] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [inviting, setInviting] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    if (!id) return;
    const c = await base44.entities.Click.get(id).catch(() => null);
    setClick(c);
    const m = await base44.entities.ClickMembership
      .filter({ click_id: id }, { limit: 50 })
      .catch(() => ({ items: [] }));
    setMembers(m.items);
    const e = await base44.entities.Event
      .filter({ click_id: id }, { sort: "start_time", limit: 50 })
      .catch(() => ({ items: [] }));
    setEvents(e.items);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="text-white px-4 py-4 flex items-center gap-3 shadow" style={{ background: FB }}>
        <Link to="/clicks" aria-label="Back">
          <ArrowLeft size={22} color="#ffffff" />
        </Link>
        <h1 className="text-xl font-bold flex-1">CliQ</h1>
      </div>

      {click && (
        <div className="bg-white border-b-4 px-4 py-5 text-center" style={{ borderColor: FB }}>
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-4" style={{ borderColor: FB }}>
            {click.avatar_url ? (
              <Image src={click.avatar_url} fittingType="fill" className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: FB }}>
                {(click.name || "?").charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-3">{click.name}</h2>
          <p className="text-sm font-semibold mt-1 flex items-center justify-center gap-1" style={{ color: FB }}>
            <Users size={14} /> {click.member_count || members.length} members
          </p>
          {click.description && (
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{click.description}</p>
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
            <div key={m.id} className="flex flex-col items-center gap-1 shrink-0 w-16">
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
            </div>
          ))}
        </div>
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