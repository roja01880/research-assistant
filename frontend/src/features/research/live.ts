import type { ApiHit, ApiPaper } from "@/lib/api";
import type { Source } from "./model";

const COLORS = ["mint", "sky", "peach"];

export function hitToSource(hit: ApiHit, index: number): Source {
  const pct = Math.max(0, Math.round(hit.score * 100));
  const words = hit.text.split(/\s+/).length;
  return {
    id: `${hit.source}|p${hit.page}|${hit.text.slice(0, 40)}`,
    title: hit.source,
    authors: `Page ${hit.page} · ${pct}% match`,
    year: 0,
    type: "Passage",
    publisher: hit.source,
    topic: hit.source,
    tags: [`${pct}% match`, `Page ${hit.page}`],
    abstract: hit.text,
    findings: [],
    limitations: "",
    minutes: Math.max(1, Math.round(words / 200)),
    color: COLORS[index % 3] ?? "mint",
    meta: `Page ${hit.page}`,
  };
}

export function paperToSource(paper: ApiPaper, index: number): Source {
  return {
    id: `paper|${paper.name}`,
    title: paper.name,
    authors: `${paper.passages} passages indexed`,
    year: 0,
    type: "Document",
    publisher: "Uploaded this session",
    topic: paper.name,
    tags: ["PDF"],
    abstract: `This document is indexed with ${paper.passages} passages. Ask a question on Discover to search it.`,
    findings: [],
    limitations: "",
    minutes: Math.max(1, Math.round((paper.passages * 250) / 200)),
    color: COLORS[index % 3] ?? "mint",
    meta: "Uploaded this session",
  };
}
