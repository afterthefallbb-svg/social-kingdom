import React from "react";
import { format } from "date-fns";
import usePlannerDoc from "@/hooks/usePlannerDoc";
import LinedText from "@/components/planner/LinedText";
import NumberedList from "@/components/planner/NumberedList";
import NotesSection from "@/components/planner/NotesSection";

// 1 AM through 12 AM (midnight)
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i + 1;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 || h === 24 ? "AM" : "PM";
  return `${h12}:00 ${ampm}`;
});
const INITIAL = { hours: {}, todos: Array.from({ length: 10 }, () => ({ text: "" })), notes: [""] };

export default function DayView({ date }) {
  const [doc, setDoc, loaded] = usePlannerDoc(`day:${format(date, "yyyy-MM-dd")}`, INITIAL);
  if (!loaded) return <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />;
  const set = (patch) => setDoc({ ...doc, ...patch });

  return (
    <>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 mb-1">Schedule</h3>
          {HOURS.map((h) => (
            <div key={h} className="flex items-end gap-1.5">
              <span className="text-[11px] text-gray-500 w-14 shrink-0 leading-6">{h}</span>
              <LinedText value={doc.hours[h]} onChange={(v) => set({ hours: { ...doc.hours, [h]: v } })} />
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-center">To-Do List</h3>
          <NumberedList items={doc.todos} onChange={(todos) => set({ todos })} addLabel="add item" />
        </div>
      </div>
      <NotesSection notes={doc.notes} onChange={(notes) => set({ notes })} />
    </>
  );
}