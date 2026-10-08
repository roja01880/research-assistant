import { Fragment, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Source } from "./model";

const CITATION = /^\[(\d+(?:\s*,\s*\d+)*)\]$/;

// Turns "[1]" or "[1, 2]" in the answer into buttons that open the matching source.
export function renderAnswer(text: string, hits: Source[], onOpen: (s: Source) => void) {
  const parts = text.replace(/\*\*/g, "").split(/(\[\d+(?:\s*,\s*\d+)*\])/g);
  return parts.map((part, i): ReactNode => {
    const match = CITATION.exec(part);
    if (!match) return <Fragment key={i}>{part}</Fragment>;
    return (
      <Fragment key={i}>
        {(match[1] ?? "").split(",").map((raw, j) => {
          const num = Number(raw.trim());
          const hit = hits[num - 1];
          return hit ? (
            <Button
              key={j}
              variant="link"
              className="citation"
              aria-label={`Open citation ${num}`}
              onClick={() => onOpen(hit)}
            >
              [{num}]
            </Button>
          ) : (
            <span key={j}>[{num}]</span>
          );
        })}
      </Fragment>
    );
  });
}
