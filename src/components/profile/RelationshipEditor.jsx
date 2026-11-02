import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Search, Heart, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import { searchUsers } from "@/lib/users";
import { RELATIONSHIP_TYPES, getRelationshipState } from "@/lib/relationships";

const FB = "#1877f2";

const initial = (n) => (n ? n.charAt(0).toUpperCase() : "?");

/* Pick a relationship status, find the person on the app, and send them the
   request. The status shows on both profiles once they accept it. */
export default function RelationshipEditor({ me, onClose, onSaved }) {
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [person, setPerson] = useState(null);
  const [sending, setSending] = useState(false);
  const [state, setState] = useState(null);

  const refresh = () => getRelationshipState(me?.id).then(setState);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    searchUsers(q, { limit: 20, excludeIds: [me?.id] }).then((list) => {
      if (active) {
        setResults(list);
        setSearching(false);
      }
    });
    return () => {
      active = false;
    };
  }, [query, me?.id]);

  async function send() {
    if (!person || !type) return;
    setSending(true);
    try {
      await base44.entities.Relationship.create({
        requester_id: me.id,
        requester_name: me.full_name || "",
        requester_avatar: me.avatar_url || "",
        partner_id: person.id,
        partner_name: person.full_name || "",
        partner_avatar: person.avatar_url || "",
        relationship_type: type,
        status: "pending"
      });
      onSaved?.();
      onClose();
      toast({
        title: "Request sent",
        description: `${person.full_name || "They"} will see it in their notifications.`
      });
    } catch (e) {
      toast({ title: "Could not send request", description: String(e.message || e) });
    } finally {
      setSending(false);
    }
  }

  async function remove(rec) {
    setSending(true);
    try {
      await base44.entities.Relationship.delete(rec.id);
      onSaved?.();
      onClose();
      toast({ title: "Relationship removed" });
    } catch (e) {
      toast({ title: "Could not update", description: String(e.message || e) });
    } finally {
      setSending(false);
    }
  }

  const accepted = state?.accepted;
  const outgoing = state?.outgoing;

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/40"
      style={{ zIndex: 2147483100, paddingBottom: "env(safe-area-inset-bottom)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="font-bold text-gray-900">Relationship</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {accepted && (
          <div className="m-4 rounded-xl border p-3" style={{ borderColor: "#c7ddff", background: "#eef5ff" }}>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Heart size={15} color={FB} /> {accepted.type}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">With {accepted.partnerName || "someone"}</p>
            <button
              onClick={() => remove(accepted)}
              disabled={sending}
              className="mt-2 text-xs font-semibold"
              style={{ color: "#b91c1c" }}
            >
              Remove relationship
            </button>
          </div>
        )}

        {!accepted && outgoing && (
          <div className="m-4 rounded-xl border p-3" style={{ borderColor: "#e5e7eb", background: "#f8fafc" }}>
            <p className="text-sm font-semibold text-gray-900">{outgoing.type}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Request sent to {outgoing.partnerName || "someone"} — waiting for them to accept.
            </p>
            <button
              onClick={() => remove(outgoing)}
              disabled={sending}
              className="mt-2 text-xs font-semibold"
              style={{ color: "#b91c1c" }}
            >
              Cancel request
            </button>
          </div>
        )}

        {!accepted && (
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Relationship status</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {RELATIONSHIP_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="rounded-lg py-2 px-2 text-xs font-semibold border text-left"
                    style={
                      type === t
                        ? { background: FB, color: "#fff", borderColor: FB }
                        : { borderColor: "#e5e7eb", color: "#374151" }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">Who are you with?</p>
              <p className="text-[11px] text-gray-400 mb-2">Search everyone on the app, then send them a request.</p>

              {person ? (
                <div className="flex items-center gap-3 p-2 rounded-lg border" style={{ borderColor: FB, background: "#eef5ff" }}>
                  <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                    {person.avatar_url ? (
                      <Image src={person.avatar_url} fittingType="fill" className="w-full h-full" />
                    ) : (
                      initial(person.full_name)
                    )}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{person.full_name || "User"}</span>
                  <button type="button" onClick={() => setPerson(null)} aria-label="Change person">
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search people by name"
                      className="pl-9"
                    />
                  </div>
                  <div className="mt-2 space-y-1 max-h-52 overflow-y-auto">
                    {searching && (
                      <div className="flex justify-center py-3">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: FB }} />
                      </div>
                    )}
                    {!searching && query.trim() && results.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-3">No one found.</p>
                    )}
                    {!searching &&
                      results.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setPerson(u)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg border border-gray-100 text-left"
                        >
                          <span className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-bold shrink-0">
                            {u.avatar_url ? (
                              <Image src={u.avatar_url} fittingType="fill" className="w-full h-full" />
                            ) : (
                              initial(u.full_name)
                            )}
                          </span>
                          <span className="flex-1 text-sm font-medium text-gray-800 truncate">{u.full_name || "User"}</span>
                          <Check size={16} style={{ color: FB }} />
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={send}
              disabled={!type || !person || sending}
              className="w-full text-white font-semibold"
              style={{ background: FB }}
            >
              {sending ? "Sending…" : "Send request"}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}