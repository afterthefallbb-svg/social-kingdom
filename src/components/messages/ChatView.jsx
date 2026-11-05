import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Ban, MoreVertical, Plus, Smile, Image as ImageIcon, User, Flag, Minimize2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { isOnline, statusEmoji, presenceBadge } from "@/lib/presence";
import { sendMessage, sendMessageWithImage, markConversationRead, getDraft, setDraft, clearDraft } from "@/lib/messaging";
import { canContact } from "@/lib/ageSafety";
import EmojiPicker from "@/components/messages/EmojiPicker";
import PresenceBadge from "@/components/presence/PresenceBadge";
import { toast } from "@/components/ui/use-toast";
import ReportDialog from "@/components/messages/ReportDialog";
import MessageActions from "@/components/messages/MessageActions";
import { visibleMessages, deleteMessageForMe, unsendMessage } from "@/lib/messageActions";
import "@/components/messages/chat-composer.css";

const FB = "#1877f2";

export default function ChatView({ me, conversation, peer, onBack, onBlocked, bubblesEnabled = false, onMinimize }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const pressTimer = useRef(null);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const title = conversation?.is_group ? (conversation.name || "Group chat") : peer?.full_name || "Chat";
  const avatar = conversation?.is_group ? conversation.avatar : peer?.avatar_url;
  const online = !conversation?.is_group && isOnline(peer);

  async function load() {
    if (!conversation?.id) return;
    const res = await base44.entities.Message.filter(
      { conversation_id: conversation.id },
      { limit: 200, sort: "created_date" }
    ).catch(() => ({ items: [] }));
    setMessages(visibleMessages(res.items, me.id));
    markConversationRead(conversation.id, me.id);
  }

  useEffect(() => {
    load();
    setText(getDraft(conversation?.id) || "");
    // Focus the composer so the keyboard opens immediately on chat open
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversation?.id) return;
      load();
    });
    return () => { clearTimeout(t); unsub && unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  // Close the three-dot menu when tapping outside it
  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Auto-grow the composer up to ~5 lines
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [text]);

  function onTextChange(val) {
    setText(val);
    setDraft(conversation?.id, val);
  }

  async function send() {
    const content = text.trim();
    if ((!content && !pendingImage) || sending || !conversation) return;
    if (!conversation.is_group) {
      const guard = canContact(me, peer);
      if (!guard.allowed) {
        toast({ title: "Message blocked", description: guard.reason });
        return;
      }
    }
    setSending(true);
    const wasText = text;
    setText("");
    clearDraft(conversation?.id);
    try {
      if (pendingImage) {
        await sendMessageWithImage(conversation, me, pendingImage, content);
        setPendingImage(null);
      } else {
        await sendMessage(conversation, me, content);
      }
      setMessages((m) => [...m, { id: Date.now(), sender_id: me.id, content, image_url: pendingImage, created_date: new Date().toISOString(), sender_name: me.full_name }]);
      load();
    } catch (e) {
      setText(wasText);
      toast({ title: "Could not send", description: String(e.message || e) });
    } finally {
      setSending(false);
    }
  }

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAttachOpen(false);
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setPendingImage(file_url);
    } catch (err) {
      toast({ title: "Upload failed", description: String(err.message || err) });
    } finally {
      setUploading(false);
    }
  }

  // Long-press (tap and hold) or right-click a bubble to open its actions
  function pressStart(m) {
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setActionMsg(m), 450);
  }

  function pressEnd() {
    clearTimeout(pressTimer.current);
  }

  useEffect(() => () => clearTimeout(pressTimer.current), []);

  function dropMessage(id) {
    setMessages((list) => list.filter((x) => x.id !== id));
  }

  async function deleteForMe() {
    const m = actionMsg;
    setActionMsg(null);
    if (!m) return;
    dropMessage(m.id);
    await deleteMessageForMe(m, me.id);
  }

  async function unsend() {
    const m = actionMsg;
    setActionMsg(null);
    if (!m) return;
    dropMessage(m.id);
    await unsendMessage(m);
    toast({ title: "Message unsent" });
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
      <div className="flex items-center gap-2 px-3 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] text-white shrink-0" style={{ background: FB }}>
        <button onClick={onBack} aria-label="Back"><ArrowLeft size={22} color="#000000" /></button>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="relative w-12 h-12 shrink-0">
            <span className="w-full h-full rounded-full overflow-hidden border-2 border-white flex items-center justify-center text-base font-bold" style={{ background: FB + "55" }}>
              {avatar ? <Image src={avatar} fittingType="fill" className="w-full h-full" /> : title.charAt(0)}
            </span>
            {!conversation?.is_group && <PresenceBadge badge={presenceBadge(peer)} className="-top-1 -right-1 text-xs" />}
          </span>
          <p className="text-xs font-bold truncate max-w-[140px] leading-tight">{title}</p>
          {conversation?.is_group && <p className="text-[10px] text-white/80 -mt-0.5">{conversation.member_ids?.length} members</p>}
        </div>
        <div className="flex-1" />
        {!conversation?.is_group && peer?.id && (
          <button onClick={() => navigate(`/profile/${peer.id}`)} className="shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-full border border-white/70 bg-white/10 active:bg-white/20">
            <User size={13} /> Profile
          </button>
        )}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="More"><MoreVertical size={20} /></button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48 z-50">
              {!conversation?.is_group && (
                <button onClick={block} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50">
                  <Ban size={15} /> Block user
                </button>
              )}
              {!conversation?.is_group && (
                <button
                  onClick={() => { setMenuOpen(false); setReportOpen(true); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  <Flag size={15} /> Report spam or abuse
                </button>
              )}
              {bubblesEnabled && (
                <button
                  onClick={() => { setMenuOpen(false); onMinimize?.(); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  <Minimize2 size={15} /> Keep as bubble
                </button>
              )}
              <button onClick={() => { setMenuOpen(false); onBack(); }} className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">Close chat</button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.length === 0 && !pendingImage && <p className="text-center text-sm text-gray-400 mt-8">No messages yet. Say hello 👋</p>}
        {messages.map((m) => {
          const mine = m.sender_id === me.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`sk-selectable max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                style={{
                  background: mine ? FB : undefined,
                  WebkitUserSelect: "text",
                  userSelect: "text",
                  WebkitTouchCallout: "default",
                }}
                onPointerDown={() => pressStart(m)}
                onPointerUp={pressEnd}
                onPointerLeave={pressEnd}
                onPointerCancel={pressEnd}
                onContextMenu={(e) => { e.preventDefault(); pressEnd(); setActionMsg(m); }}
              >
                {!mine && conversation?.is_group && <p className="text-[10px] font-semibold mb-0.5" style={{ color: FB }}>{m.sender_name?.split(" ")[0]}</p>}
                {m.image_url && <Image src={m.image_url} fittingType="fit" className="rounded-xl mb-1 max-h-60 w-full" />}
                {m.content && <p className="break-words">{m.content}</p>}
              </div>
            </div>
          );
        })}
        {pendingImage && (
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl px-3 py-2 text-sm text-white" style={{ background: FB }}>
              <Image src={pendingImage} fittingType="fit" className="rounded-xl mb-1 max-h-60 w-full" />
              {text && <p className="break-words">{text}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Emoji panel */}
      {emojiOpen && <EmojiPicker onPick={(e) => onTextChange(text + e)} />}

      {/* Attach menu */}
      {attachOpen && (
        <div className="border-t bg-white p-2">
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 text-sm text-gray-800">
            <ImageIcon size={18} style={{ color: FB }} /> Photo from device
          </button>
        </div>
      )}

      {/* Composer */}
      <div className="shrink-0 border-t bg-white p-2 pb-[max(7.375rem,calc(env(safe-area-inset-bottom)_+_70px))] flex items-end gap-1.5">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
        <button onClick={() => { setAttachOpen((o) => !o); setEmojiOpen(false); }} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: FB + "22", color: FB }} aria-label="Attach">
          <Plus size={20} />
        </button>
        <button onClick={() => { setEmojiOpen((o) => !o); setAttachOpen(false); }} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: FB + "22", color: FB }} aria-label="Emoji">
          <Smile size={20} />
        </button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={1}
          placeholder={uploading ? "Uploading…" : "Message…"}
          disabled={uploading}
          className="sk-composer-input flex-1 resize-none rounded-2xl border px-4 py-2 text-sm outline-none max-h-[120px] leading-5 overflow-y-auto"
        />
        <button onClick={send} disabled={sending || uploading || (!text.trim() && !pendingImage)} className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: FB }}>
          <Send size={18} />
        </button>
      </div>

      {actionMsg && (
        <MessageActions
          message={actionMsg}
          mine={actionMsg.sender_id === me.id}
          onDeleteForMe={deleteForMe}
          onUnsend={unsend}
          onClose={() => setActionMsg(null)}
        />
      )}

      {reportOpen && (
        <ReportDialog
          me={me}
          peer={peer}
          conversation={conversation}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}