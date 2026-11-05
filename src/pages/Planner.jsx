import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, addMonths, addWeeks, addYears, format, startOfWeek } from "date-fns";
import DayView from "@/components/planner/DayView";
import WeekView from "@/components/planner/WeekView";
import MonthView from "@/components/planner/MonthView";
import YearView from "@/components/planner/YearView";

const FB = "#1877f2";
const VIEWS = [
  { id: "day", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];
const STEP = { day: addDays, week: addWeeks, month: addMonths, year: addYears };

function heading(view, d) {
  if (view === "day") return format(d, "EEEE, MMMM d, yyyy");
  if (view === "week") return `Week of ${format(startOfWeek(d), "MMM d, yyyy")}`;
  if (view === "month") return format(d, "MMMM yyyy");
  return format(d, "yyyy");
}

export default function Planner() {
  const navigate = useNavigate();
  const [view, setView] = useState("day");
  const [date, setDate] = useState(new Date());

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-xl">Planner</span>
      </div>
      <div className="h-[3px] w-14 bg-gray-900 ml-4 mt-2 rounded-full" />

      <div className="px-4 mt-4 max-w-3xl mx-auto">
        <div className="flex gap-2">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => { setView(v.id); if (v.id === "day") setDate(new Date()); }}
              className="flex-1 rounded-full py-1.5 text-base font-semibold"
              style={view === v.id ? { background: FB, color: "#fff" } : { background: "#eef2f7", color: "#1f2937" }}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 mb-4">
          <h2 className="font-bold text-gray-900 text-lg">{heading(view, date)}</h2>
          <div className="flex gap-1">
            <button onClick={() => setDate(STEP[view](date, -1))} className="p-1 rounded-full hover:bg-gray-100" aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setDate(STEP[view](date, 1))} className="p-1 rounded-full hover:bg-gray-100" aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {view === "day" && <DayView date={date} />}
        {view === "week" && <WeekView date={date} />}
        {view === "month" && <MonthView date={date} />}
        {view === "year" && <YearView date={date} />}
      </div>
    </div>
  );
}