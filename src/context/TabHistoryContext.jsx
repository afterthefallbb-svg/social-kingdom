import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* Each bottom-tab (Browse, Map, Create) keeps its own little navigation stack,
   so leaving a tab for another and coming back lands where you left off, and
   tapping the tab you are already on steps back through that tab's history. */
const TABS = { browse: "/browse", map: "/", create: "/create" };

const EMPTY = { browse: [], map: [], create: [] };

function tabFor(pathname) {
  if (pathname === TABS.browse || pathname.startsWith("/browse/")) return "browse";
  if (pathname === TABS.map) return "map";
  if (pathname === TABS.create || pathname.startsWith("/create/")) return "create";
  return null;
}

const TabHistoryContext = createContext({
  activeTab: "map",
  restoreTab: () => {},
  historyFor: () => [],
});

export function TabHistoryProvider({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("map");
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

  /* Tapping the tab you are already viewing pops back to the page you were on
     in that tab before this one. */
  const restoreTab = useCallback(
    (tab) => {
      const stack = stacks.current[tab] || [];
      const previous = [...stack].reverse().find((p) => p !== pathname && p !== TABS[tab]);
      if (previous) navigate(previous);
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