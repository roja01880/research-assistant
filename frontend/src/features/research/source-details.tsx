import { Bookmark, Check, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Source } from "./model";
import { useResearch } from "./state";
import { ResearchSelect } from "./controls";
export function SourceDetails({ source, onClose }: { source: Source | null; onClose: () => void }) {
  const { saved, toggleSaved, collectionNames, assignments, assign } = useResearch();
  const isSaved = source ? saved.includes(source.id) : false;
  return (
    <Dialog
      open={Boolean(source)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="source-dialog">
        {source && (
          <>
            <div className="detail-eyebrow">
              <FileText size={17} />
              {source.type}
              {source.meta ? ` · ${source.meta}` : ""}
            </div>
            <DialogTitle className="detail-title">{source.title}</DialogTitle>
            <DialogDescription>{source.authors}</DialogDescription>
            <div className="detail-actions">
              <Button
                variant={isSaved ? "secondary" : "default"}
                onClick={() => toggleSaved(source.id)}
              >
                {isSaved ? <Check /> : <Bookmark />}
                {isSaved ? "Saved to collection" : "Save source"}
              </Button>
              {isSaved && (
                <ResearchSelect
                  label="Collection"
                  value={assignments[source.id] || "Reading list"}
                  onChange={(v) => assign(source.id, v)}
                  options={collectionNames.map((v) => ({ value: v, label: v }))}
                />
              )}
            </div>
            <h3 className="section-label">
              {source.type === "Passage" ? "Excerpt from your paper" : "About this document"}
            </h3>
            <p className="detail-copy">{source.abstract}</p>
            <p className="demo-footnote">Text extracted from your uploaded document.</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
