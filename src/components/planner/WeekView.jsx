import React from "react";
import { addDays, format, startOfWeek } from "date-fns";
import usePlannerDoc from "@/hooks/usePlannerDoc";
import LinedText from "@/components/planner/LinedText";

const LINES = 4;

// Sunday through Saturday, each with writable lines.
export default function WeekView({ date }) {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const [doc, setDoc, loaded] = usePlannerDoc(`week:${format(start, "yyyy-MM-dd")}`, { days: {} });
  if (!loaded) return <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />;

  const setLine = (dayKey, i, v) => {
    const lines = [...(doc.days[dayKey] || Array(LINES).fill(""))];
    lines[i] = v;
    setDoc({ ...doc, days: { ...doc.days, [dayKey]: lines } });
  };

  return (
    <div className="space-y-5">
      {Array.from({ length: 7 }, (_, d) => {
        const day = addDays(start, d);
        const k = format(day, "yyyy-MM-dd");
        const lines = doc.days[k] || Array(LINES).fill("");
        return (
          <div key={k}>
            <h3 className="font-bold text-gray-900 text-base">
              {format(day, "EEEE")} <span className="font-normal text-gray-400">{format(day, "MMM d")}</span>
            </h3>
            <div className="space-y-1 mt-1">
              {lines.map((l, i) => (
                <LinedText key={i} value={l} onChange={(v) => setLine(k, i, v)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}