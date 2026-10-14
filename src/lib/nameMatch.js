// Fuzzy, forgiving name matching for in-list search.
// Returns true when every space-separated token of `query` appears somewhere
// in `name` (case-insensitive), so partial/misspelled names still match
// (e.g. "jo sm" matches "John Smith", "sara" matches "Sarah Connor").
export function matchesName(name, query) {
  const n = (name || "").toLowerCase();
  const tokens = (query || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((t) => n.includes(t));
}