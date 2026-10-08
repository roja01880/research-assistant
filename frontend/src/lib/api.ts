export interface ApiPaper {
  name: string;
  passages: number;
}
export interface ApiHit {
  n: number;
  source: string;
  page: number;
  score: number;
  text: string;
}
export interface AskResult {
  answer: string | null;
  notice: string | null;
  sources: ApiHit[];
}

// Set VITE_API_URL in .env (local) or in your host's environment settings (deployed).
const configured = import.meta.env["VITE_API_URL"] as string | undefined;
export const API_URL = (configured || "http://localhost:8000").replace(/\/$/, "");

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error(`Can't reach the backend at ${API_URL}. Is it running?`);
  }
  let data: { detail?: string } | null = null;
  try {
    data = (await res.json()) as { detail?: string };
  } catch {
    data = null;
  }
  if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
  return data as T;
}

export const listPapers = () => call<{ papers: ApiPaper[] }>("/api/papers");

export function uploadPapers(files: File[]) {
  const body = new FormData();
  files.forEach((f) => body.append("files", f));
  return call<{ papers: ApiPaper[]; skipped: string[] }>("/api/upload", { method: "POST", body });
}

export const removePaper = (name: string) =>
  call<{ papers: ApiPaper[] }>(`/api/papers/${encodeURIComponent(name)}`, { method: "DELETE" });

export const askPapers = (question: string, k = 4) =>
  call<AskResult>("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, k }),
  });
