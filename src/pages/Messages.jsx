import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import MessageHeader from "@/components/messages/MessageHeader";
import OnlineFriendsRow from "@/components/messages/OnlineFriendsRow";
import MessageSearchBar from "@/components/messages/MessageSearchBar";
import MessageSearchResults from "@/components/messages/MessageSearchResults";
import ConversationList from "@/components/messages/ConversationList";
import MessageSettings from "@/components/messages/MessageSettings";
import ChatView from "@/components/messages/ChatView";
import { markOnline } from "@/lib/presence";
import { getOrCreateDirectConversation, createGroupConversation } from "@/lib/messaging";
import { toast } from "@/components/ui/use-toast";

const FB = "#1877f2";
const DIRECTIONS = [
  { key: "incoming", label: "Incoming" },
  { key: "sent", label: "Sent" },
  { key: "drafts", label: "Drafts" },
  { key: "archived", label: "Archived" },
];

export default function Messages() {
  const [me, setMe] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeConv, setActiveConv] = useState(null);
  const [activePeer, setActivePeer] = useState(null);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [filters, setFilters] = useState({ city: "", job: "", company: "" });
  const [direction, setDirection] = useState("incoming");
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = await base44.auth.me().catch(() => null);
      if (!active || !current) return;
      setMe(current);
      markOnline(current);
      const t = setInterval(() => markOnline(current), 90000);
      return () => clearInterval(t);
    })();
    return () => { active = false; };
  }, []);

  // Auto-open a chat when arriving via ?chat=<userId> (from a profile Message toggle)
  useEffect(() => {
    if (!me?.id) return;
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get("chat");
    if (!chatId) return;
    (async () => {
      try {
        const u = await base44.entities.User.filter({ id: chatId }, { limit: 1 }).catch(() => ({ items: [] }));
        const user = (u.items || [])[0] || { id: chatId };
        const conv = await getOrCreateDirectConversation(me, user);
        setActivePeer(user);
        setActiveConv(conv);
        setRefreshKey((k) => k + 1);
      } catch (e) {
        toast({ title: "Could not open chat", description: String(e.message || e) });
      }
      window.history.replaceState({}, "", "/messages");
    })();
  }, [me?.id]);

  async function openFriend(user) {
    if (!user?.id) return;
    try {
      const conv = await getOrCreateDirectConversation(me, user);
      setActivePeer(user);
      setActiveConv(conv);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast({ title: "Could not open chat", description: String(e.message || e) });
    }
  }

  function startSelect(user) {
    setSelecting(true);
    setSelected([user]);
  }
  function toggleSelect(user) {
    setSelected((s) => {
      const exists = s.find((x) => x.id === user.id);
      return exists ? s.filter((x) => x.id !== user.id) : [...s, user];
    });
  }
  async function createGroup() {
    if (selected.length < 1) return;
    try {
      const conv = await createGroupConversation(me, selected);
      setSelecting(false);
      setSelected([]);
      setActivePeer(null);
      setActiveConv(conv);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast({ title: "Could not create group", description: String(e.message || e) });
    }
  }

  if (activeConv) {
    return (
      <ChatView
        me={me}
        conversation={activeConv}
        peer={activePeer}
        onBack={() => { setActiveConv(null); setActivePeer(null); setRefreshKey((k) => k + 1); }}
        onBlocked={() => setRefreshKey((k) => k + 1)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <MessageHeader me={me} onOpenSettings={() => setSettingsOpen(true)} />

      {selecting ? (
        <div className="sticky top-0 z-20 bg-white border-b px-3 py-2 flex items-center gap-2 shadow-sm">
          <button onClick={() => { setSelecting(false); setSelected([]); }} className="text-sm text-gray-500">Cancel</button>
          <span className="flex-1 text-sm font-semibold text-gray-900">Select members ({selected.length})</span>
          <button onClick={createGroup} disabled={selected.length < 1} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40" style={{ background: FB }}>
            Create Group
          </button>
        </div>
      ) : null}

      <OnlineFriendsRow
        me={me}
        onSelectFriend={openFriend}
        onLongPress={startSelect}
        selecting={selecting}
        selected={selected.map((s) => s.id)}
        toggleSelect={toggleSelect}
      />

      <MessageSearchBar
        query={query}
        setQuery={setQuery}
        scope={scope}
        setScope={setScope}
        filters={filters}
        setFilters={setFilters}
      />

      <div className="bg-white rounded-t-2xl mt-1 min-h-[40vh]">
        {query.trim() ? (
          <MessageSearchResults me={me} query={query} scope={scope} filters={filters} onSelectFriend={openFriend} />
        ) : (
          <>
            <div className="flex gap-1 px-2 pt-3 pb-1 overflow-x-auto no-scrollbar">
              {DIRECTIONS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDirection(d.key)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
                  style={direction === d.key ? { background: FB, color: "#fff" } : { background: FB + "14", color: FB }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <ConversationList
              me={me}
              onOpen={(c, peer) => { setActiveConv(c); setActivePeer(peer); }}
              onGroupOpened={(conv) => { setActiveConv(conv); setActivePeer(null); setRefreshKey((k) => k + 1); }}
              refreshKey={refreshKey}
              scope={scope}
              direction={direction}
            />
          </>
        )}
      </div>

      {settingsOpen && (
        <MessageSettings me={me} onClose={() => setSettingsOpen(false)} onSaved={(u) => setMe(u)} />
      )}
    </div>
  );
}