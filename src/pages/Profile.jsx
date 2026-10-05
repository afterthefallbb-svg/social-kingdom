import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutCard from "@/components/profile/AboutCard";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import PostsFeed from "@/components/profile/PostsFeed";
import CliQsCard from "@/components/profile/CliQsCard";
import GatheringsCard from "@/components/profile/GatheringsCard";

export default function Profile() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [clicks, setClicks] = useState([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => setMe(null));
    base44.entities.Click
      .filter({}, { limit: 20 })
      .then((page) => setClicks(page.items))
      .catch(() => setClicks([]));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="space-y-3 p-3 pt-4">
        <ProfileHeader me={me} onEdit={() => setEditing(true)} onMessages={() => navigate("/messages")} />
        <AboutCard me={me} onSaved={setMe} />
        <PostsFeed me={me} />
        <CliQsCard clicks={clicks} />
        <GatheringsCard me={me} />
      </div>

      {editing && (
        <EditProfileDialog me={me} onClose={() => setEditing(false)} onSaved={setMe} />
      )}
    </div>
  );
}