import { ArrowUpRight, Bookmark, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Source } from "./model";
import { useResearch } from "./state";
export function SourceCard({
  source,
  onOpen,
}: {
  source: Source;
  onOpen: (source: Source) => void;
}) {
  const { saved, toggleSaved } = useResearch();
  const isSaved = saved.includes(source.id);
  return (
    <article className="source-card">
      <div className={`source-symbol tone-${source.color}`}>
        <FileText size={21} />
      </div>
      <div className="source-body">
        <div className="source-meta">
          <span>{source.type}</span>
          <span>·</span>
          <span>{source.meta ?? `${source.year} · ${source.minutes} min read`}</span>
        </div>
        <Button variant="link" className="source-title" onClick={() => onOpen(source)}>
          {source.title}
          <ArrowUpRight size={16} />
        </Button>
        <p className="source-authors">{source.authors}</p>
        <p className="source-excerpt">{source.abstract}</p>
        <div className="source-tags">
          {source.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
          <span className="source-publisher">{source.publisher}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={isSaved ? "save-button is-saved" : "save-button"}
        aria-label={`${isSaved ? "Unsave" : "Save"} ${source.title}`}
        aria-pressed={isSaved}
        title={isSaved ? "Remove from saved" : "Save source"}
        onClick={() => toggleSaved(source.id)}
      >
        {isSaved ? <Check /> : <Bookmark />}
      </Button>
    </article>
  );
}
