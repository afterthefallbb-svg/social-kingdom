import React from "react";
import { format, getDay, getDaysInMonth, isSameDay, startOfMonth } from "date-fns";
import usePlannerDoc from "@/hooks/usePlannerDoc";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

// Monthly calendar with a small note box for each day.
export default function MonthView({ date }) {
  const first = startOfMonth(date);
  const [doc, setDoc, loaded] = usePlannerDoc(`month:${format(first, "yyyy-MM")}`, { days: {} });
  if (!loaded) return <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />;

  const lead = getDay(first);
  const total = getDaysInMonth(first);
  const today = new Date();

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d, i) => (
          <div key={i} className="text-center text-sm font-semibold text-gray-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: lead }, (_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const isToday = isSameDay(new Date(first.getFullYear(), first.getMonth(), n), today);
          return (
            <div key={n} className="border border-gray-200 rounded-md p-1 min-h-[70px] flex flex-col">
              <span className={`text-sm font-bold ${isToday ? "text-white bg-[#1877f2] rounded-full w-6 h-6 flex items-center justify-center" : "text-gray-700"}`}>
                {n}
              </span>
              <textarea
                value={doc.days[n] || ""}
                onChange={(e) => setDoc({ ...doc, days: { ...doc.days, [n]: e.target.value } })}
                className="flex-1 w-full resize-none bg-transparent outline-none text-xs leading-tight mt-0.5"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}