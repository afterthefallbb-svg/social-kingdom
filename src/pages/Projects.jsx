import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import usePlannerDoc from "@/hooks/usePlannerDoc";
import NumberedList from "@/components/planner/NumberedList";
import NotesSection from "@/components/planner/NotesSection";

const FB = "#1877f2";
const blank = (n) => Array.from({ length: n }, () => ({ text: "" }));
const INITIAL = { title: "", goals: blank(2), todos: blank(6), notes: [""] };

export default function Projects() {
  const navigate = useNavigate();
  const [doc, setDoc, loaded] = usePlannerDoc("project", INITIAL);
  const set = (patch) => setDoc({ ...doc, ...patch });

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/browse")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg">Projects</span>
      </div>
      <div className="h-[3px] w-12 bg-gray-900 ml-4 mt-2 rounded-full" />

      {!loaded ? (
        <div className="px-4 mt-6 w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
      ) : (
        <div className="px-4 mt-5 max-w-3xl mx-auto">
          <input
            value={doc.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Project name"
            className="w-full text-xl font-bold outline-none border-b border-gray-200 pb-1 mb-6"
          />
          <div className="grid grid-cols-2 gap-5">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Goals</h3>
              <NumberedList items={doc.goals} onChange={(goals) => set({ goals })} addLabel="add goal" withDate />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-center">To-Do List</h3>
              <NumberedList items={doc.todos} onChange={(todos) => set({ todos })} addLabel="add item" />
            </div>
          </div>
          <NotesSection notes={doc.notes} onChange={(notes) => set({ notes })} />
        </div>
      )}
    </div>
  );
}