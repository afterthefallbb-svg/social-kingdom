import React, { useLayoutEffect, useRef } from "react";

// Auto-growing textarea that looks like a dotted writing line and wraps onto new lines.
export default function LinedText({ value, onChange, placeholder, className = "" }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-none overflow-hidden bg-transparent outline-none text-base leading-7 border-b-2 border-dotted border-gray-300 focus:border-gray-400 ${className}`}
    />
  );
}