import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "@/components/category/category-page-header.css";

/* Sticky page header for hub category pages: the title row stays pinned while
   the category content scrolls up and disappears underneath it. */
export default function CategoryPageHeader({ title, subtitle, backTo = "/browse", onBack, children }) {
  const navigate = useNavigate();

  return (
    <header className="category-page-header">
      <div className="category-page-row">
        <button
          type="button"
          onClick={onBack || (() => navigate(backTo))}
          className="category-page-back"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="min-w-0 flex-1">
          <span className="category-page-title">{title}</span>
          {subtitle && <span className="category-page-subtitle">{subtitle}</span>}
        </div>
        {children && <div className="category-page-actions">{children}</div>}
      </div>
      <div className="category-page-underline" />
    </header>
  );
}