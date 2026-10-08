import fixtures from "./sources.json";
export interface Source {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: string;
  publisher: string;
  topic: string;
  tags: string[];
  abstract: string;
  findings: string[];
  limitations: string;
  minutes: number;
  color: string;
  meta?: string;
}
export const sources: Source[] = fixtures;
export type Section = "discover" | "library" | "collections";
export type SortOrder = "relevance" | "newest" | "oldest";
export function filterSources(
  items: Source[],
  query: string,
  type: string,
  year: string,
  sort: SortOrder,
) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (t) =>
        t.length > 2 &&
        !["how", "the", "and", "for", "can", "does", "with", "what", "are", "help"].includes(t),
    );
  const score = (s: Source) =>
    terms.filter((t) =>
      `${s.title} ${s.abstract} ${s.topic} ${s.tags.join(" ")}`.toLowerCase().includes(t),
    ).length;
  return items
    .filter(
      (s) =>
        (!terms.length || score(s) > 0) &&
        (type === "all" || s.type === type) &&
        (year === "all" || String(s.year) === year),
    )
    .sort((a, b) =>
      sort === "newest"
        ? b.year - a.year
        : sort === "oldest"
          ? a.year - b.year
          : score(b) - score(a),
    );
}
export function validateUpload(file: { name: string; size: number }) {
  if (!/\.(pdf|txt|docx)$/i.test(file.name)) return "Choose a PDF, TXT, or DOCX file.";
  if (file.size > 10 * 1024 * 1024) return "This file exceeds the 10 MB limit.";
  if (file.size === 0) return "This file is empty. Choose a file with content.";
  return null;
}
export const suggestedQueries = [
  "What is the main contribution of these papers?",
  "What methods and datasets do the authors use?",
  "What limitations do the authors mention?",
];
