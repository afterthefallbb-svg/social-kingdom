import React from "react";
import { Image } from "@/components/ui/image";

export default function HubSearchResult({ result, onSelect }) {
  return (
    <button type="button" className="hub-search-result" onClick={() => onSelect(result)}>
      <span className="hub-search-thumb">
        {result.image ? <Image src={result.image} fittingType="fill" /> : <span>{result.emoji || "•"}</span>}
      </span>
      <span className="hub-search-text">
        <span className="hub-search-title">{result.title}</span>
        {result.subtitle && <span className="hub-search-sub">{result.subtitle}</span>}
      </span>
      <span className="hub-search-kind">{result.kind}</span>
    </button>
  );
}