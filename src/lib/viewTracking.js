import { base44 } from "@/api/base44Client";

const VISITOR_KEY = "sk_visitor_key";
const SESSION_FLAG = "sk_view_tracked";

function visitorKey() {
  let key = localStorage.getItem(VISITOR_KEY);
  if (!key) {
    key = crypto.randomUUID ? crypto.randomUUID() : `sk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, key);
  }
  return key;
}

// One view per browser session, so navigating around the app doesn't inflate the count.
export function trackAppView() {
  try {
    if (sessionStorage.getItem(SESSION_FLAG)) return;
    sessionStorage.setItem(SESSION_FLAG, "1");
    base44.functions
      .invoke("trackAppView", { visitor_key: visitorKey(), path: window.location.pathname })
      .catch(() => {});
  } catch {
    /* storage unavailable — skip tracking */
  }
}