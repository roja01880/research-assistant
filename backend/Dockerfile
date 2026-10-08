FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 HF_HOME=/tmp/hf
# CPU-only PyTorch keeps the image small
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Download the embedding model at build time so the first request is fast
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
COPY server.py .
EXPOSE 7860
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-7860}"]
