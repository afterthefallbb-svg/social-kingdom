import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/video/VideoPlayer";
import HubBackdrop from "@/components/hub/HubBackdrop";
import HubHeader from "@/components/hub/HubHeader";
import HubShortcuts from "@/components/hub/HubShortcuts";
import HubCategoryRow from "@/components/hub/HubCategoryRow";
import CreatorStats from "@/components/hub/CreatorStats";
import useSocialHub from "@/components/hub/useSocialHub";
import hubItems from "@/components/hub/hubItems";
import useGuest from "@/hooks/useGuest";
import "@/components/hub/kingdom.css";
import "@/components/hub/kingdom-materials.css";
import "@/components/hub/hub-layout.css";
import "@/components/hub/creator-stats.css";

export default function SocialHub() {
  const navigate = useNavigate();
  const data = useSocialHub();
  const { me, videos } = data;
  const [playerState, setPlayerState] = useState(null);
  const rows = hubItems(data, navigate);
  const { guest } = useGuest();

  /* A visitor can look around the hub and its example rows, but every feature
     inside it leads to the sign-up screen. */
  const gate = (e) => {
    if (!guest) return;
    e.preventDefault();
    e.stopPropagation();
    navigate("/register");
  };

  return (
    <div className="kingdom-hub" onClickCapture={guest ? gate : undefined}>
      <HubBackdrop />
      <div className="kingdom-shell">
        <div className="kingdom-pinned">
          <HubHeader me={me} />
          <HubShortcuts me={me} onOpenVideo={(video) => setPlayerState({ videos: [video], index: 0 })} />
        </div>
        <div className="kingdom-feed" data-tour="hub-feed">
          <div className="kingdom-sections">
            <CreatorStats me={me} />
            <HubCategoryRow title="Stream" kind="stream" onTitle={() => navigate("/stream")} items={rows.stream} emptyText="No videos yet." onVideoClick={(index) => setPlayerState({ videos, index })} />
            <HubCategoryRow title="Events" kind="events" onTitle={() => navigate("/browse/events")} items={rows.events} emptyText="No events in your area yet." />
            <HubCategoryRow title="Artists" kind="artists" onTitle={() => navigate("/browse/artists")} items={rows.artists} emptyText="No local artists yet." />
            <HubCategoryRow title="CliQs" kind="cliqs" onTitle={() => navigate("/browse/cliqs")} items={rows.cliqs} emptyText="No CliQs yet." />
          </div>
        </div>
      </div>

      {playerState && (
        <VideoPlayer
          videos={playerState.videos}
          startIndex={playerState.index}
          onClose={() => setPlayerState(null)}
        />
      )}

    </div>
  );
}