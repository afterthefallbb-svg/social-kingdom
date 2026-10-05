import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

export default function Layout() {
  return (
    <div className="relative min-h-screen bg-white">
      <Outlet />
      <BottomNav />
    </div>
  );
}