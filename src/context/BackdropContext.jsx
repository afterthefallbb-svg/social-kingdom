import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/* The app-wide backdrop choice. The setting lives on the server so every
   visitor sees the same look; a local copy paints instantly on the next load
   before the server answers. */
const BackdropContext = createContext({ mode: "kingdom", setMode: async () => {} });
const STORAGE_KEY = "sk_backdrop";

const readCached = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "white" ? "white" : "kingdom";
  } catch {
    return "kingdom";
  }
};

export function BackdropProvider({ children }) {
  const [mode, setModeState] = useState(readCached);

  useEffect(() => {
    let active = true;
    // A plain read, so visitors who never sign in see the owner's choice too.
    fetch("/functions/appBackdrop", { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        const next = data?.mode === "white" ? "white" : "kingdom";
        if (!active) return;
        setModeState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {}
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setMode = async (next) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    await base44.functions.invoke("appBackdrop", { mode: next }).catch(() => {});
  };

  return (
    <BackdropContext.Provider value={{ mode, setMode }}>{children}</BackdropContext.Provider>
  );
}

export const useBackdrop = () => useContext(BackdropContext);