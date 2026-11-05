import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, UserPlus, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FB = "#1877f2";

export default function Viewers() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!active) return;
      if (me?.role !== "admin") {
        navigate("/browse", { replace: true });
        return;
      }
      setAllowed(true);
      const res = await base44.functions.invoke("getCreatorStats", {}).catch(() => null);
      if (active && res?.data) setStats(res.data);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const rows = [
    { icon: Eye, label: "Visitors", value: stats?.visitors, sub: "unique people who opened the app" },
    { icon: Eye, label: "Total views", value: stats?.total_views, sub: "app opens counted every 30 minutes per visitor" },
    { icon: Users, label: "People on the app", value: stats?.total_users, sub: "every account created" },
    { icon: UserPlus, label: "New this week", value: stats?.new_users_week, sub: `${stats?.new_users_month ?? 0} new in the last 30 days` },
  ];

  if (!allowed) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1" aria-label="Back">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Viewers</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      <p className="px-4 mt-4 text-xs text-gray-500">Only you can see these numbers. No visitor names or personal details are stored.</p>

      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {rows.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-2xl border border-gray-200 p-3">
            <Icon size={18} style={{ color: FB }} />
            <p className="mt-1 text-2xl font-bold text-gray-900">{value ?? "–"}</p>
            <p className="text-xs font-semibold text-gray-800">{label}</p>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}