import React from "react";
import { Check, X } from "lucide-react";
import { Image } from "@/components/ui/sk-image";
import { getCategory } from "@/lib/categories";

const FB = "#1877f2";

const initial = (n) => (n ? n.charAt(0).toUpperCase() : "?");

function Avatar({ src, name, cls = "w-11 h-11" }) {
  return (
    <span className={`${cls} rounded-full overflow-hidden flex items-center justify-center text-base font-bold bg-gray-100 shrink-0`}>
      {src ? <Image src={src} fittingType="fill" className="w-full h-full" /> : initial(name)}
    </span>
  );
}

function ToggleRow({ left, onAccept, onDeny, acceptLabel, denyLabel, id, acting }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
      <div className="flex-1 min-w-0">{left}</div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onAccept}
          disabled={acting === id}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: FB }}
        >
          <Check size={14} className="inline -mt-0.5" /> {acceptLabel}
        </button>
        <button
          onClick={onDeny}
          disabled={acting === id}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 disabled:opacity-50"
        >
          <X size={14} className="inline -mt-0.5" /> {denyLabel}
        </button>
      </div>
    </div>
  );
}

export default function NotifList({ category, items, actions, acting, navigate }) {
  if (!items || items.length === 0) {
    if (category === "klout") {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="text-lg">👑</span>
          <span>No new Klout notifications yet.</span>
        </div>
      );
    }
    return <p className="text-sm text-gray-400">Nothing here right now.</p>;
  }

  if (category === "friends") {
    return items.map((r) => (
      <ToggleRow
        key={r.id}
        id={r.id}
        acting={acting}
        acceptLabel="Accept"
        denyLabel="Deny"
        onAccept={() => actions.acceptFriend(r)}
        onDeny={() => actions.denyFriend(r)}
        left={
          <button onClick={() => navigate(`/profile/${r.user_id}`)} className="flex items-center gap-3 min-w-0 text-left">
            <Avatar src={r.friend_avatar} name={r.friend_name} />
            <span className="min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate block">{r.friend_name || "Unknown"}</span>
              <span className="text-[11px] text-gray-400">wants to be your friend</span>
            </span>
          </button>
        }
      />
    ));
  }

  if (category === "relationship") {
    return items.map((r) => (
      <ToggleRow
        key={r.id}
        id={r.id}
        acting={acting}
        acceptLabel="Accept"
        denyLabel="Decline"
        onAccept={() => actions.acceptRelationship(r)}
        onDeny={() => actions.declineRelationship(r)}
        left={
          <button onClick={() => navigate(`/profile/${r.requester_id}`)} className="flex items-center gap-3 min-w-0 text-left">
            <Avatar src={r.requester_avatar} name={r.requester_name} />
            <span className="min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate block">{r.requester_name || "Someone"}</span>
              <span className="text-[11px] text-gray-400 truncate block">
                requested relationship status: <span className="font-semibold text-gray-600">{r.relationship_type}</span>
              </span>
            </span>
          </button>
        }
      />
    ));
  }

  if (category === "events") {
    return items.map((inv) => {
      const cat = getCategory(inv.target_category);
      return (
        <ToggleRow
          key={inv.id}
          id={inv.id}
          acting={acting}
          acceptLabel="Attend"
          denyLabel="Reject"
          onAccept={() => actions.attendEvent(inv)}
          onDeny={() => actions.rejectEvent(inv)}
          left={
            <button onClick={() => navigate(`/event/${inv.target_id}`)} className="flex items-center gap-3 min-w-0 text-left">
              <span className="relative shrink-0">
                <span className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-2xl bg-gray-100">
                  {inv.target_image ? (
                    <Image src={inv.target_image} fittingType="fill" className="w-full h-full" />
                  ) : (
                    cat.emoji
                  )}
                </span>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs shadow-sm">
                  {cat.emoji}
                </span>
              </span>
              <span className="min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate block">{inv.target_name}</span>
                <span className="text-[11px] text-gray-400 truncate block">{inv.target_address || "Location"}</span>
                <span className="text-[10px] text-gray-400">from {inv.inviter_name || "someone"}</span>
              </span>
            </button>
          }
        />
      );
    });
  }

  if (category === "cliqs") {
    return items.map((inv) => (
      <ToggleRow
        key={inv.id}
        id={inv.id}
        acting={acting}
        acceptLabel="Join"
        denyLabel="Reject"
        onAccept={() => actions.joinCliq(inv)}
        onDeny={() => actions.rejectCliq(inv)}
        left={
          <button onClick={() => navigate(`/clicks/${inv.target_id}`)} className="flex items-center gap-3 min-w-0 text-left">
            <Avatar src={inv.target_image} name={inv.target_name} />
            <span className="min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate block">{inv.target_name}</span>
              <span className="text-[11px] text-gray-400">invited you to join this CliQ</span>
            </span>
          </button>
        }
      />
    ));
  }

  if (category === "posts") {
    return items.map((n) => (
      <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
        <button
          onClick={() => { actions.markPostRead?.(n); navigate(n.target_type === "event" ? `/event/${n.target_id}` : `/browse`); }}
          className="flex items-center gap-3 min-w-0 text-left flex-1"
        >
          <Avatar src={n.actor_avatar} name={n.actor_name} />
          <span className="min-w-0">
            <span className="text-sm font-semibold text-gray-900 truncate block">{n.title}</span>
            {n.body && <span className="text-[11px] text-gray-400 truncate block">{n.body}</span>}
          </span>
        </button>
      </div>
    ));
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span className="text-lg">👑</span>
      <span>No new Klout notifications yet.</span>
    </div>
  );
}