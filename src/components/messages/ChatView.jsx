import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Ban, MoreVertical } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { isOnline, statusEmoji } from "@/lib/presence";
import { sendMessage, markConversationRead } from "@/lib/messaging";
import { toast } from "@/components/ui/use-toast";

const FB = "#1877f2";

export default function ChatView({ me, conversation, peer, onBack, onBlocked }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const title = conversation?.is_group ? (conversation.name || "Group chat") : peer?.full_name || "Chat";
  const avatar = conversation?.is_group ? conversation.avatar : peer?.avatar_url;
  const online = !conversation?.is_group && isOnline(peer);

  async function load() {
    if (!conversation?.id) return;
    const res = await base44.entities.Message.filter(
      { conversation_id: conversation.id },
      { limit: 200, sort: "created_date" }
    ).catch(() => ({ items: [] }));
    setMessages(res.items || []);
    markConversationRead(conversation.id, me.id);
  }

  useEffect(() => {
    load();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversation?.id) return;
      load();
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const content = text.trim();
    if (!content || sending || !conversation) return;
    setSending(true);
    setText("");
    try {
      await sendMessage(conversation, me, content);
      // optimistic
      setMessages((m) => [...m, { id: Date.now(), sender_id: me.id, content, created_date: new Date().toISOString(), sender_name: me.full_name }]);
      load();
    } catch (e) {
      toast({ title: "Could not send", description: String(e.message || e) });
    } finally {
      setSending(false);
    }
  }

  async function block() {
    if (!peer?.id) return;
    setMenuOpen(false);
    try {
      await base44.entities.Block.create({ blocker_id: me.id, blocked_id: peer.id, blocked_name: peer.full_name || "" });
      toast({ title: "User blocked" });
      onBlocked?.();
      onBack();
    } catch (e) {
      toast({ title: "Could not block", description: String(e.message || e) });
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 text-white shrink-0" style={{ background: FB }}>
        <button onClick={onBack} aria-label="Back"><ArrowLeft size={22} /></button>
        <span className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white flex items-center justify-center text-sm font-bold" style={{ background: FB + "55" }}>
          {avatar ? <Image src={avatar} fittingType="fill" className="w-full h-full" /> : title.charAt(0)}
          {!conversation?.is_group && <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full px-0.5">{online ? statusEmoji(peer) : "⚫"}</span>}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{title}</p>
          <p className="text-[11px] text-white/80">{conversation?.is_group ? `${conversation.member_ids?.length} members` : online ? "Active now" : "Offline"}</p>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="More"><MoreVertical size={20} /></button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40 z-50">
              {!conversation?.is_group && (
                <button onClick={block} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50">
                  <Ban size={15} /> Block user
                </button>
              )}
              <button onClick={() => { setMenuOpen(false); onBack(); }} className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">Close chat</button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.length === 0 && <p className="text-center text-sm text-gray-400 mt-8">No messages yet. Say hello 👋</p>}
        {messages.map((m) => {
          const mine = m.sender_id === me.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "text-white" : "bg-white border border-gray-200 text-gray-900"}`} style={mine ? { background: FB } : {}}>
                {!mine && conversation?.is_group && <p className="text-[10px] font-semibold mb-0.5" style={{ color: FB }}>{m.sender_name?.split(" ")[0]}</p>}
                <p className="break-words">{m.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t bg-white p-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
          className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none"
        />
        <button onClick={send} disabled={sending || !text.trim()} className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: FB }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}