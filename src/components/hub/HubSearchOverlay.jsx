import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { SEARCH_FILTERS, searchHub } from "@/lib/hubSearch";
import HubSearchResult from "@/components/hub/HubSearchResult";

export default function HubSearchOverlay({ onClose, onOpenVideo }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const q = term.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      const found = await searchHub(q, filter);
      if (!active) return;
      setResults(found);
      setLoading(false);
    }, 280);
    return () => { active = false; clearTimeout(timer); };
  }, [term, filter]);

  const choose = (result) => {
    onClose();
    if (result.video && onOpenVideo) {
      onOpenVideo(result.video);
      return;
    }
    if (result.to) navigate(result.to);
  };

  return (
    <div className="hub-search-overlay" role="dialog" aria-label="Search Social Kingdom">
      <div className="hub-search-top">
        <div className="hub-search-row">
          <div className="hub-search-field">
            <Search size={18} />
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search the Kingdom…"
              aria-label="Search the Kingdom"
            />
            {term && (
              <button type="button" onClick={() => setTerm("")} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
          <button type="button" className="hub-search-cancel" onClick={onClose}>Cancel</button>
        </div>
        <div className="hub-search-filters no-scrollbar" role="group" aria-label="Search filters">
          {SEARCH_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="hub-search-chip"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hub-search-results">
        {loading && <p className="hub-search-note">Searching…</p>}
        {!loading && !term.trim() && (
          <p className="hub-search-note">
            Search events, people, CliQs, artists, videos, groups, posts and marketplace listings.
          </p>
        )}
        {!loading && term.trim() && results.length === 0 && (
          <p className="hub-search-note">No matches for “{term.trim()}”.</p>
        )}
        {!loading && results.map((result) => (
          <HubSearchResult key={result.id} result={result} onSelect={choose} />
        ))}
      </div>
    </div>
  );
}