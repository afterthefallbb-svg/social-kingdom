import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PreferenceDialog from "@/components/profile/PreferenceDialog";
import BioPickerDialog from "@/components/profile/BioPickerDialog";

const FB = "#1877f2";
const TEXT_FIELDS = ["bio", "job", "birthday", "location"];

const FIELDS = [
  { field: "bio", label: "Bio", emoji: "📝", placeholder: "A short intro about you" },
  { field: "location", label: "City, State", emoji: "📍", placeholder: "Walla Walla, WA" },
  { field: "birthday", label: "Birthday", emoji: "🎂", placeholder: "MM/DD/YYYY" },
  { field: "job", label: "Job", emoji: "💼", placeholder: "Barista at ..." },
  { field: "professional_interests", label: "Professional Interests", emoji: "📈", placeholder: "Marketing, Startups" },
  { field: "traits", label: "Personal Traits", emoji: "✨", placeholder: "Outgoing, Loyal, Funny" },
  { field: "interests", label: "Interests", emoji: "⭐", placeholder: "Music, Sports, Tech" },
  { field: "hobbies", label: "Hobbies", emoji: "🎯", placeholder: "Hiking, Gaming, Cooking" },
  { field: "goals", label: "Goals", emoji: "🏆", placeholder: "Run a 5k, Learn guitar" },
  { field: "music", label: "Music", emoji: "🎵", placeholder: "Hip-hop, Jazz, Indie" },
  { field: "family_members", label: "Family Members", emoji: "👪", placeholder: "Sister (Emma), Brother (Jake)" }
];

export default function ProfileAbout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

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
        <h1 className="font-bold text-gray-900">About</h1>
      </div>

      <div className="p-3 space-y-2 max-w-2xl mx-auto">
        {FIELDS.map((f) => {
          const isText = TEXT_FIELDS.includes(f.field);
          const raw = me?.[f.field];
          const has = isText ? !!raw : Array.isArray(raw) && raw.length > 0;
          const preview = isText ? raw || "" : (raw || []).join(", ");
          return (
            <div key={f.field} className="bg-white rounded-2xl shadow-sm p-4">
              {isMe ? (
                <button onClick={() => setEditing(f)} className="w-full text-left">
                  <p className="text-sm font-semibold text-gray-800"><span className="mr-1.5">{f.emoji}</span>{f.label}</p>
                  <p className={`text-xs ${has ? "text-gray-500" : "text-gray-400"}`}>
                    {has ? preview : `Add your ${f.label.toLowerCase()}`}
                  </p>
                </button>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-800"><span className="mr-1.5">{f.emoji}</span>{f.label}</p>
                  <p className={`text-xs ${has ? "text-gray-500" : "text-gray-400"}`}>
                    {has ? preview : "—"}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {editing && TEXT_FIELDS.includes(editing.field) && (
        <PreferenceDialog
          field={editing.field}
          label={editing.label}
          placeholder={editing.placeholder}
          me={me}
          onClose={() => setEditing(null)}
          onSaved={setMe}
        />
      )}
      {editing && !TEXT_FIELDS.includes(editing.field) && (
        <BioPickerDialog
          field={editing.field}
          label={editing.label}
          placeholder={editing.placeholder}
          me={me}
          onClose={() => setEditing(null)}
          onSaved={setMe}
        />
      )}
    </div>
  );
}