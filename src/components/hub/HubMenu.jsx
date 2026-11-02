import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MessageSquare, LifeBuoy, LogOut, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DeleteAccountDialog from "@/components/account/DeleteAccountDialog";

const FB = "#1877f2";

export default function HubMenu({ me: meProp, buttonClassName }) {
  const navigate = useNavigate();
  const [me, setMe] = useState(meProp || null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const ref = useRef(null);

  // The menu always knows who is signed in, even before the page finishes loading.
  useEffect(() => {
    if (meProp) {
      setMe(meProp);
      return;
    }
    let active = true;
    base44.auth
      .me()
      .then((u) => active && setMe(u))
      .catch(() => active && setMe(null));
    return () => {
      active = false;
    };
  }, [meProp]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    base44.auth.logout(window.location.origin + "/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className={buttonClassName || "inline-flex items-center justify-center rounded-full p-2"}
      >
        <Menu size={24} className={buttonClassName ? "text-kingdom-text" : "text-foreground"} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
          <button
            onClick={() => go("/contact")}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
          >
            <MessageSquare size={18} style={{ color: FB }} /> Feedback
          </button>
          <button
            onClick={() => go("/support")}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
          >
            <LifeBuoy size={18} style={{ color: FB }} /> Support
          </button>
          {me && (
            <>
              <div className="my-1 h-px bg-gray-100" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
              >
                <LogOut size={18} style={{ color: FB }} /> Log Out
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setDeleteOpen(true);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} className="text-red-600" /> Delete My Account
              </button>
            </>
          )}
          {!me && (
            <>
              <div className="my-1 h-px bg-gray-100" />
              <button
                onClick={() => go("/login")}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
              >
                <LogOut size={18} style={{ color: FB }} /> Log In
              </button>
            </>
          )}
        </div>
      )}

      {deleteOpen && me && (
        <DeleteAccountDialog userId={me.id} onClose={() => setDeleteOpen(false)} />
      )}
    </div>
  );
}