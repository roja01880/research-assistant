import { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { uploadPapers, type ApiPaper } from "@/lib/api";
const MAX_BYTES = 10 * 1024 * 1024;
function problem(file: File) {
  if (!/\.pdf$/i.test(file.name)) return "Choose PDF files only.";
  if (file.size === 0) return "This file is empty. Choose a file with content.";
  if (file.size > MAX_BYTES) return "This file exceeds the 10 MB limit.";
  return null;
}
export function UploadPanel({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: (papers: ApiPaper[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  function acceptFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const invalid = incoming.map(problem).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    setNotice("");
    setFiles((prev) => [
      ...prev,
      ...incoming.filter((f) => !prev.some((p) => p.name === f.name && p.size === f.size)),
    ]);
  }
  async function send() {
    setBusy(true);
    setError("");
    try {
      const res = await uploadPapers(files);
      onUploaded(res.papers);
      setFiles([]);
      if (res.skipped.length) {
        setNotice(`No readable text in: ${res.skipped.join(", ")}. Scanned PDFs are not supported.`);
      } else {
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="upload-dialog">
        <DialogTitle>Add your documents</DialogTitle>
        <DialogDescription>
          PDFs are read by the backend, split into passages, and kept in memory for this session.
        </DialogDescription>
        <div
          className="upload-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            acceptFiles(e.dataTransfer.files);
          }}
        >
          <Upload size={30} />
          <h3>Bring your research together</h3>
          <p>PDF with selectable text · up to 10 MB each</p>
          <Button variant="outline" onClick={() => input.current?.click()}>
            Choose files
          </Button>
          <input
            ref={input}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="sr-only"
            aria-label="Upload documents"
            onChange={(e) => {
              acceptFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        {error && (
          <p className="error-copy" role="alert">
            {error}
          </p>
        )}
        {notice && <p className="error-copy">{notice}</p>}
        <div aria-live="polite">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="uploaded-file">
              <FileText size={20} />
              <span>
                {file.name}
                <small>{(file.size / 1024).toFixed(1)} KB · ready to index</small>
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${file.name}`}
                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
        {files.length > 0 && (
          <>
            <p className="upload-notice">
              <CheckCircle2 size={16} />
              {busy ? "Reading and indexing. The first upload can take a minute." : "Ready to index."}
            </p>
            <Button disabled={busy} onClick={send}>
              {busy ? "Indexing…" : `Index ${files.length} file${files.length > 1 ? "s" : ""}`}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
