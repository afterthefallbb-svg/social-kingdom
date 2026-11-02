import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BioChips from "@/components/profile/BioChips";
import RelationshipCard from "@/components/profile/RelationshipCard";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

const FIELDS = [
  { field: "bio", label: "Bio", emoji: "📝" },
  { field: "location", label: "City, State", emoji: "📍" },
  { field: "birthday", label: "Birthday", emoji: "🎂" },
  { field: "job", label: "Job", emoji: "💼" },
  { field: "professional_interests", label: "Professional Interests", emoji: "📈" },
  { field: "interests", label: "Interests", emoji: "⭐" },
  { field: "hobbies", label: "Hobbies", emoji: "🎯" },
  { field: "goals", label: "Goals", emoji: "🏆" },
  { field: "music", label: "Music", emoji: "🎵" },
  { field: "family_members", label: "Family Members", emoji: "👪" }
];

// Read-only view. Everything here is edited from Edit Profile, never in place.
export default function ProfileAbout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setMe(u);
      if (id && id !== u?.id) {
        const other = await base44.entities.User.get(id).catch(() => null);
        setProfile(other || u);
      } else {
        setProfile(u);
      }
    }).catch(() => {});
  }, [id]);

  const isMe = !id || id === me?.id;
  const back = id ? `/profile/${id}` : "/profile";

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div
        className="bg-white sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "#eef0f3" }}
      >
        <button onClick={() => navigate(back)} aria-label="Back">
          <ArrowLeft size={20} className="text-black" />
        </button>
        <h1 className="font-bold text-gray-900 flex-1">About</h1>
        {isMe && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
            style={{ background: "#1877f2" }}
          >
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>

      <div className="p-3 space-y-2 max-w-2xl mx-auto">
        <RelationshipCard me={me} profileId={id || me?.id} isMe={isMe} />
        {FIELDS.map((f) => {
          const raw = profile?.[f.field];
          const has = Array.isArray(raw) ? raw.length > 0 : !!raw;
          return (
            <div key={f.field} className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-800">
                <span className="mr-1.5">{f.emoji}</span>{f.label}
              </p>
              {has ? (
                Array.isArray(raw) ? (
                  <div className="mt-1.5"><BioChips items={raw} /></div>
                ) : (
                  <p className="text-xs text-gray-500">{raw}</p>
                )
              ) : (
                <p className="text-xs text-gray-400">{isMe ? `Add your ${f.label.toLowerCase()} in Edit Profile` : "—"}</p>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <EditProfileDialog
          me={profile}
          onClose={() => setEditing(false)}
          onSaved={(u) => {
            setProfile(u);
            setMe(u);
          }}
        />
      )}
    </div>
  );
}