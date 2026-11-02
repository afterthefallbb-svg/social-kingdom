import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import RelationshipEditor from "@/components/profile/RelationshipEditor";
import { getRelationshipState } from "@/lib/relationships";

/* Relationship row on the bio/About page — shows the confirmed status on both
   people's profiles, and opens the editor for the profile's owner. */
export default function RelationshipCard({ me, profileId, isMe }) {
  const [state, setState] = useState(null);
  const [open, setOpen] = useState(false);

  const load = () => getRelationshipState(profileId).then(setState);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const accepted = state?.accepted;
  const outgoing = state?.outgoing;
  const value = accepted
    ? `${accepted.type} with ${accepted.partnerName || "someone"}`
    : outgoing
      ? `${outgoing.type} · waiting for ${outgoing.partnerName || "them"} to accept`
      : "";

  const body = (
    <>
      <p className="text-sm font-semibold text-gray-800">
        <span className="mr-1.5">💞</span>Relationship
      </p>
      <p className={`text-xs ${value ? "text-gray-500" : "text-gray-400"}`}>
        {value || (isMe ? "Add your relationship status" : "—")}
      </p>
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {isMe ? (
        <button onClick={() => setOpen(true)} className="w-full text-left">
          {body}
        </button>
      ) : (
        body
      )}

      {open && (
        <RelationshipEditor
          me={me}
          onClose={() => setOpen(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}