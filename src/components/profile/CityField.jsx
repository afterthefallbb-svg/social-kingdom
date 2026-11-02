import React, { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";

/* City entry with real-place suggestions, so a city is never misspelled.
   Typing "walla" suggests Walla Walla, Washington — tap it to fill the field. */
export default function CityField({ value, onChange, placeholder = "Walla Walla, WA" }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const skipNext = useRef(false);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return undefined;
    }
    const query = (value || "").trim();
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke("searchCities", { query });
        if (!active) return;
        setSuggestions(res.data?.cities || []);
        setOpen(true);
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [value]);

  const choose = (city) => {
    skipNext.current = true;
    onChange(city.label);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div>
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
          autoComplete="off"
          autoFocus
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="mt-1.5 rounded-xl border border-gray-200 overflow-hidden max-h-56 overflow-y-auto">
          {suggestions.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => choose(city)}
              className="w-full text-left px-3 py-2.5 text-sm text-gray-800 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              {city.label}
            </button>
          ))}
        </div>
      )}

      {open && !loading && suggestions.length === 0 && (
        <p className="mt-1.5 text-xs text-gray-400">No matching city — you can still type your own and save.</p>
      )}
    </div>
  );
}