import React from "react";
import { format, getDay, getDaysInMonth, isSameDay } from "date-fns";

// View-only year at a glance: 12 mini calendars.
export default function YearView({ date }) {
  const year = date.getFullYear();
  const today = new Date();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: 12 }, (_, m) => {
        const first = new Date(year, m, 1);
        const lead = getDay(first);
        const total = getDaysInMonth(first);
        return (
          <div key={m} className="rounded-lg border border-gray-200 p-2">
            <p className="text-xs font-bold text-gray-900 text-center mb-1">{format(first, "MMMM")}</p>
            <div className="grid grid-cols-7 gap-px text-[9px] text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="text-gray-400 font-semibold">{d}</span>
              ))}
              {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
              {Array.from({ length: total }, (_, i) => {
                const isToday = isSameDay(new Date(year, m, i + 1), today);
                return (
                  <span key={i} className={isToday ? "bg-[#1877f2] text-white rounded-full" : "text-gray-700"}>
                    {i + 1}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}