import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Image } from "@/components/ui/image";
import ClickPresenceBadge from "@/components/presence/ClickPresenceBadge";
import { useClickHosts } from "@/hooks/useClickHosts";

const FB = "#1877f2";

export default function CliQsSection({ clicks }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const hosts = useClickHosts(clicks);

  return (
    <div className="p-4" style={{ textShadow: "0 1px 4px rgba(255,255,255,0.95)" }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="font-bold text-gray-900 flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
            style={{ background: FB }}
          >
            👥
          </span>
          CliQs
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3">
          {clicks.length === 0 ? (
            <p className="text-xs text-gray-400">No CliQs joined yet.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {clicks.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/clicks/${c.id}`)}
                  className="flex flex-col items-center gap-1 shrink-0 w-16"
                >
                  <span className="relative w-14 h-14 shrink-0">
                    <span
                      className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center text-sm font-bold"
                      style={{ borderColor: FB, background: FB + "22", color: FB }}
                    >
                      {c.avatar_url ? (
                        <Image src={c.avatar_url} fittingType="fill" className="w-full h-full" />
                      ) : (
                        (c.name || "?").charAt(0)
                      )}
                    </span>
                    <ClickPresenceBadge click={c} host={hosts[c.id]} className="-top-1 -right-1 text-xs" />
                  </span>
                  <span className="text-[10px] text-gray-600 text-center leading-tight truncate w-full">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}