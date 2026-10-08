import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { ApiPaper } from "@/lib/api";
import type { Source } from "./model";
export interface AnswerState {
  query: string;
  text: string | null;
  notice: string | null;
}
interface ResearchState {
  saved: string[];
  toggleSaved: (id: string) => void;
  query: string;
  setQuery: (query: string) => void;
  collectionNames: string[];
  addCollection: (name: string) => void;
  assignments: Record<string, string>;
  assign: (id: string, collection: string) => void;
  pool: Record<string, Source>;
  addToPool: (items: Source[]) => void;
  papers: ApiPaper[];
  setPapers: (papers: ApiPaper[]) => void;
  answer: AnswerState | null;
  setAnswer: (answer: AnswerState | null) => void;
  hits: Source[];
  setHits: (hits: Source[]) => void;
}
const Context = createContext<ResearchState | null>(null);
export function ResearchProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [collectionNames, setCollectionNames] = useState(["Reading list", "Literature review"]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [pool, setPool] = useState<Record<string, Source>>({});
  const [papers, setPapers] = useState<ApiPaper[]>([]);
  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const [hits, setHits] = useState<Source[]>([]);
  function toggleSaved(id: string) {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function addCollection(name: string) {
    setCollectionNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }
  const addToPool = useCallback((items: Source[]) => {
    setPool((prev) => {
      const next = { ...prev };
      items.forEach((s) => {
        next[s.id] = s;
      });
      return next;
    });
  }, []);
  return (
    <Context.Provider
      value={{
        saved,
        toggleSaved,
        query,
        setQuery,
        collectionNames,
        addCollection,
        assignments,
        assign: (id, collection) => setAssignments((prev) => ({ ...prev, [id]: collection })),
        pool,
        addToPool,
        papers,
        setPapers,
        answer,
        setAnswer,
        hits,
        setHits,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useResearch() {
  const value = useContext(Context);
  if (!value) throw new Error("ResearchProvider is required");
  return value;
}
