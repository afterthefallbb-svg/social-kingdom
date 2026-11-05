import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* Each bottom-tab (Browse, Map, Create) keeps its own little navigation stack,
   so leaving a tab for another and coming back lands where you left off.
   Tapping the tab you are already on resets that tab to its root instead of
   stepping back through history (unpredictable inside an iOS WebView). */
const TABS = { browse: "/", map: "/map", create: "/create" };

const EMPTY = { browse: [], map: [], create: [] };

function tabFor(pathname) {
  if (pathname === "/browse" || pathname.startsWith("/browse/")) return "browse";
  if (pathname === TABS.map) return "map";
  if (pathname === TABS.create || pathname.startsWith("/create/")) return "create";
  return "browse";
}

const TabHistoryContext = createContext({
  activeTab: "browse",
  restoreTab: () => {},
  historyFor: () => [],
});

export function TabHistoryProvider({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("browse");
  const stacks = useRef({ ...EMPTY });

  useEffect(() => {
    const tab = tabFor(pathname);
    if (tab) setActiveTab(tab);
    const owner = tab || activeTab;
    const stack = stacks.current[owner] || (stacks.current[owner] = []);
    if (stack[stack.length - 1] !== pathname) {
      stack.push(pathname);
      if (stack.length > 25) stack.shift();
    }
  }, [pathname, activeTab]);

  const historyFor = useCallback((tab) => [...(stacks.current[tab] || [])], []);

  /* Tapping the tab you are already viewing returns straight to that tab's
     root page and drops the stack it had built up. */
  const restoreTab = useCallback(
    (tab) => {
      const root = TABS[tab];
      if (!root) return;
      stacks.current[tab] = [];
      if (pathname !== root) navigate(root);
    },
    [navigate, pathname]
  );

  return (
    <TabHistoryContext.Provider value={{ activeTab, restoreTab, historyFor }}>
      {children}
    </TabHistoryContext.Provider>
  );
}

export function useTabHistory() {
  return useContext(TabHistoryContext);
}

export { TABS };