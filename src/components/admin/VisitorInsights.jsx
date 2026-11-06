import React, { useEffect, useState } from "react";
import { ArrowDownRight, DoorOpen, LogIn, Share2, UserX } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FB = "#1877f2";

const LABELS = {
  "/": "Social hub",
  "/map": "Event map",
  "/browse": "Browse",
  "/register": "Sign up",
  "/login": "Log in",
  "/stream": "Stream",
  "/clicks": "CliQs",
  "/messages": "Messages",
  "/profile": "Profile",
  "/groups": "Groups",
  "/music": "Music",
  "/buy-sell": "Buy & sell",
  "/games": "Games",
  "/feed": "Feed",
  "/notifications": "Notifications",
};

function pageLabel(path) {
  if (!path || path === "unknown") return "Unknown";
  if (LABELS[path]) return LABELS[path];
  if (path.startsWith("/event/")) return "Event page";
  if (path.startsWith("/profile")) return "Profile page";
  if (path.startsWith("/clicks/")) return "CliQ page";
  if (path.startsWith("/listing/")) return "Listing page";
  if (path.startsWith("/browse/")) return "Category page";
  return path;
}

function sourceLabel(source) {
  if (!source || source === "unknown") return "Unknown";
  if (source === "direct") return "Typed / direct link";
  return source;
}

function BarList({ rows, max, tone }) {
  if (!rows.length) {
    return (
      <p className="text-[11px] text-gray-500 leading-tight mt-1">
        Nothing recorded yet — this fills in as people use the app from now on.
      </p>
    );
  }
  return (
    <div className="mt-2 space-y-1.5">
      {rows.map(({ label, count }) => (
        <div key={label} className="relative overflow-hidden rounded-lg bg-gray-100 px-2.5 py-1.5">
          <div
            className="absolute inset-y-0 left-0 rounded-lg opacity-25"
            style={{ width: `${Math.max(6, (count / max) * 100)}%`, background: tone }}
          />
          <div className="relative flex items-center justify-between gap-2">
            <span className="truncate text-[12px] font-semibold text-gray-800">{label}</span>
            <span className="shrink-0 text-[12px] font-bold" style={{ color: tone }}>
              {count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ icon: Icon, title, caption, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-3">
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: FB }} />
        <p className="text-sm font-bold text-gray-900">{title}</p>
      </div>
      {caption && <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{caption}</p>}
      {children}
    </div>
  );
}

const decorate = (rows) => {
  const list = (rows || []).map((r) => ({ label: r.label, count: r.count }));
  const max = Math.max(1, ...list.map((r) => r.count));
  return { list, max };
};

export default function VisitorInsights() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    base44.functions
      .invoke("getVisitorInsights", {})
      .then((res) => active && setData(res?.data || null))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  if (failed) return null;

  if (!data) {
    return (
      <div className="px-4 mt-5 flex items-center gap-2 text-xs text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        Loading visitor activity…
      </div>
    );
  }

  const exits = decorate(data.exits?.map((r) => ({ label: pageLabel(r.label), count: r.count })));
  const entries = decorate(data.entries?.map((r) => ({ label: pageLabel(r.label), count: r.count })));
  const sources = decorate(data.sources?.map((r) => ({ label: sourceLabel(r.label), count: r.count })));

  return (
    <div className="px-4 mt-6 space-y-3">
      <div>
        <p className="text-sm font-bold text-gray-900">Visitor activity</p>
        <p className="text-[11px] text-gray-500 leading-tight">
          Where people land, where they come from and the last page they were on before leaving.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-200 p-3">
          <UserX size={18} style={{ color: FB }} />
          <p className="mt-1 text-2xl font-bold text-gray-900">{data.guests ?? 0}</p>
          <p className="text-xs font-semibold text-gray-800">Left without signing up</p>
          <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
            of {data.visitors ?? 0} visitors · {data.total_accounts ?? 0} accounts
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 p-3">
          <LogIn size={18} style={{ color: FB }} />
          <p className="mt-1 text-2xl font-bold text-gray-900">{data.signed_in_visitors ?? 0}</p>
          <p className="text-xs font-semibold text-gray-800">Visited signed in</p>
          <p className="text-[11px] text-gray-500 leading-tight mt-0.5">already had an account</p>
        </div>
      </div>

      <Section
        icon={DoorOpen}
        title="Left on this page"
        caption="The last screen a visit had open when they closed the app."
      >
        <BarList rows={exits.list} max={exits.max} tone={FB} />
      </Section>

      <Section icon={Share2} title="Came from" caption="Where the visit started — link, search engine or app.">
        <BarList rows={sources.list} max={sources.max} tone="#8b5cf6" />
      </Section>

      <Section icon={ArrowDownRight} title="Landed on" caption="The first page they opened in the app.">
        <BarList rows={entries.list} max={entries.max} tone="#0ea5a4" />
      </Section>

      {data.recent?.length > 0 && (
        <Section icon={DoorOpen} title="Latest visits" caption="The newest 12 sessions.">
          <div className="mt-2 space-y-1">
            {data.recent.map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-gray-800">{pageLabel(row.path)}</p>
                  <p className="truncate text-[10px] text-gray-500">from {sourceLabel(row.source)}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={
                    row.signed_in
                      ? { background: "#e8f0fe", color: FB }
                      : { background: "#fdeaea", color: "#c0392b" }
                  }
                >
                  {row.signed_in ? "signed in" : "no account"}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}