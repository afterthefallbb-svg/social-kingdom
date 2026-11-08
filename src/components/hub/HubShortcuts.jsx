import React from "react";
import HubIconRow from "@/components/hub/HubIconRow";
import HubSearch from "@/components/hub/HubSearch";
import SignUpBar from "@/components/hub/SignUpBar";

export default function HubShortcuts({ me, onOpenVideo }) {
  return (
    <div className="kingdom-shortcuts">
      <SignUpBar />
      <HubIconRow me={me} />
      <HubSearch onOpenVideo={onOpenVideo} />
    </div>
  );
}