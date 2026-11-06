import { base44 } from "@/api/base44Client";

const VISITOR_KEY = "sk_visitor_key";
const SESSION_FLAG = "sk_view_tracked";
const PATH_KEY = "sk_current_path";

function visitorKey() {
  let key = localStorage.getItem(VISITOR_KEY);
  if (!key) {
    key = crypto.randomUUID ? crypto.randomUUID() : `sk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, key);
  }
  return key;
}

function referrerHost() {
  if (!document.referrer) return "";
  try {
    return new URL(document.referrer).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// The last screen a visitor was on, kept so a closing app can report it.
export function notePath(path) {
  try {
    sessionStorage.setItem(PATH_KEY, path);
  } catch {
    /* storage unavailable — skip */
  }
}

let beaconReady = false;
let leaving = false;

function sendExit() {
  const path = sessionStorage.getItem(PATH_KEY) || window.location.pathname;
  const body = JSON.stringify({ visitor_key: visitorKey(), exit: path });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `${window.location.origin}/functions/trackAppView`,
        new Blob([body], { type: "application/json" }),
      );
    } else {
      base44.functions.invoke("trackAppView", { visitor_key: visitorKey(), exit: path }).catch(() => {});
    }
  } catch {
    /* nothing to do — leaving anyway */
  }
}

// Report the page they leave on when the app closes or is backgrounded.
function armExitBeacon() {
  if (beaconReady) return;
  beaconReady = true;
  window.addEventListener("pagehide", () => {
    leaving = true;
    sendExit();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && !leaving) sendExit();
  });
}

// One view per browser session, so navigating around the app doesn't inflate the count.
export function trackAppView() {
  try {
    if (!sessionStorage.getItem(SESSION_FLAG)) {
      sessionStorage.setItem(SESSION_FLAG, "1");
      base44.functions
        .invoke("trackAppView", {
          visitor_key: visitorKey(),
          path: window.location.pathname,
          referrer: referrerHost(),
        })
        .catch(() => {});
    }
    notePath(window.location.pathname);
    armExitBeacon();
  } catch {
    /* storage unavailable — skip tracking */
  }
}