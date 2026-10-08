"""Research Assistant backend: reads PDFs, finds relevant passages, asks Gemini for a cited answer."""
import os

import fitz  # PyMuPDF
import numpy as np
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

load_dotenv()
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash")
CHUNK_WORDS, OVERLAP_WORDS = 250, 50
# Comma-separated list of allowed frontend URLs. "*" allows any (fine for a hackathon demo).
ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]

app = FastAPI(title="Research Assistant API")
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_methods=["*"], allow_headers=["*"])

_embedder = None
_llm = None
INDEX = {}  # filename -> {"chunks": [...], "vectors": np.ndarray}


def embedder():
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


def llm():
    global _llm
    if _llm is None:
        _llm = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    return _llm


def extract_chunks(pdf_bytes, filename):
    chunks = []
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    for page_num, page in enumerate(doc, start=1):
        words = page.get_text().split()
        step = CHUNK_WORDS - OVERLAP_WORDS
        for start in range(0, len(words), step):
            text = " ".join(words[start : start + CHUNK_WORDS])
            if len(text.split()) > 30:
                chunks.append({"text": text, "source": filename, "page": page_num})
    return chunks


def retrieve(question, top_k):
    chunks = [c for item in INDEX.values() for c in item["chunks"]]
    vectors = np.vstack([item["vectors"] for item in INDEX.values()])
    q = embedder().encode([question], normalize_embeddings=True)[0]
    scores = vectors @ q
    top = np.argsort(scores)[::-1][:top_k]
    return [(chunks[i], float(scores[i])) for i in top]


def answer(question, hits):
    context = "\n\n".join(
        f"[{n}] ({c['source']}, page {c['page']})\n{c['text']}" for n, (c, _) in enumerate(hits, start=1)
    )
    prompt = f"""You are a research assistant. Answer the question using ONLY the
excerpts below. Cite sources like [1], [2] after the claims they support.
If the excerpts don't contain the answer, say you couldn't find it.

Excerpts:
{context}

Question: {question}"""
    return llm().models.generate_content(model=LLM_MODEL, contents=prompt).text


def papers_list():
    return [{"name": n, "passages": len(v["chunks"])} for n, v in INDEX.items()]


@app.get("/")
@app.get("/api/health")
def health():
    return {"status": "ok", "papers": len(INDEX), "llm_configured": bool(os.getenv("GEMINI_API_KEY"))}


@app.get("/api/papers")
def papers():
    return {"papers": papers_list()}


@app.post("/api/upload")
def upload(files: list[UploadFile] = File(...)):
    skipped = []
    for f in files:
        try:
            chunks = extract_chunks(f.file.read(), f.filename)
        except Exception:
            chunks = []
        if not chunks:
            skipped.append(f.filename)
            continue
        vectors = embedder().encode([c["text"] for c in chunks], normalize_embeddings=True)
        INDEX[f.filename] = {"chunks": chunks, "vectors": np.array(vectors)}
    return {"papers": papers_list(), "skipped": skipped}


@app.delete("/api/papers/{name}")
def remove(name: str):
    INDEX.pop(name, None)
    return {"papers": papers_list()}


class Ask(BaseModel):
    question: str
    k: int = 4


@app.post("/api/ask")
def ask(body: Ask):
    if not INDEX:
        raise HTTPException(400, "Add at least one PDF first.")
    hits = retrieve(body.question, max(2, min(body.k, 8)))
    sources = [
        {"n": n, "source": c["source"], "page": c["page"], "score": s, "text": c["text"]}
        for n, (c, s) in enumerate(hits, start=1)
    ]
    # Retrieval works without an LLM. Without a key we still return the matching passages.
    if not os.getenv("GEMINI_API_KEY"):
        return {"answer": None, "sources": sources,
                "notice": "No GEMINI_API_KEY is set on the backend, so only matching passages are shown."}
    try:
        text = answer(body.question, hits)
    except Exception as e:
        return {"answer": None, "sources": sources,
                "notice": f"Gemini could not write an answer ({e}). Showing matching passages instead."}
    return {"answer": text, "sources": sources, "notice": None}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
