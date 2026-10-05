import React from "react";
import { Pencil } from "lucide-react";

const FB = "#1877f2";

function Chips({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {items.map((t, i) => (
          <span
            key={i}
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: FB + "15", color: FB }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AboutCard({ me, onEdit }) {
  const traits = me?.traits || [];
  const hobbies = me?.hobbies || [];
  const music = me?.music || [];
  const bio = me?.bio || "";
  const empty = !bio && traits.length === 0 && hobbies.length === 0 && music.length === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">About</h3>
        <button onClick={onEdit} className="text-gray-400" aria-label="Edit about">
          <Pencil size={15} />
        </button>
      </div>
      {empty ? (
        <p className="text-sm text-gray-400 mt-2">
          Add your bio, personal traits, hobbies, and music to your profile.
        </p>
      ) : (
        <>
          {bio && <p className="text-sm text-gray-700 mt-2">{bio}</p>}
          <Chips label="Personal Traits" items={traits} />
          <Chips label="Hobbies" items={hobbies} />
          <Chips label="Music" items={music} />
        </>
      )}
    </div>
  );
}