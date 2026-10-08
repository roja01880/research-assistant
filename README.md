# Research Assistant

Upload research papers (PDF), ask questions in plain language, and get answers written only from your papers, with page-level citations.

- `frontend/` - React app (TanStack Start). Talks to the backend through `frontend/src/lib/api.ts`.
- `backend/` - Python API (FastAPI). Reads PDFs, finds relevant passages with sentence-transformers, asks Gemini for a cited answer.

## Run locally (two terminals)

**1. Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows   (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env         # Mac/Linux: cp .env.example .env   then add GEMINI_API_KEY
python server.py
```
Check http://localhost:8000/api/health. Without a key, the app still returns matching passages; with a key it also writes a cited answer.

**2. Frontend** (needs Node.js 20+)
```bash
cd frontend
copy .env.example .env         # Mac/Linux: cp .env.example .env
npm install
npm run dev
```
Open the URL it prints (usually http://localhost:5173 or 3000).

## Deploy
- **Backend:** build from `backend/Dockerfile` (Hugging Face Spaces with the Docker SDK, or Render). Set `GEMINI_API_KEY` as a secret and, once the frontend is live, `ALLOWED_ORIGINS` to its URL.
- **Frontend:** deploy `frontend/` from GitHub (Cloudflare, Netlify, or Vercel). Set `VITE_API_URL` to the backend's public URL **before building**, because Vite bakes it into the build.

## Notes
- Uploaded papers are kept in the backend's memory and are lost when it restarts.
- Passages found for each question are sent to Gemini to write the answer.
- Never commit `.env` files. Only `.env.example` belongs in the repo.
