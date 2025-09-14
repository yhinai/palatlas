# Palatlas

A minimalist, AI-powered business environment explorer. Palatlas visualizes brand popularity and local business insights using Qloo data and generates concise business analysis with OpenAI.

## Quick Start (Local)

Prerequisites:
- Node.js 18+
- Python 3.11+

1) Install and build frontend
```bash
npm ci
npm run build
```

2) Prepare backend static files
```bash
mkdir -p Backend/static
cp -R dist/* Backend/static/
```

3) Create and fill `.env`
```bash
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
QLOO_API_KEY=your_qloo_key
# MAPBOX_ACCESS_TOKEN=your_mapbox_token (optional)
```

4) Create venv and install backend deps
```bash
python3 -m venv .venv
./.venv/bin/pip install -r Backend/requirements.txt
```

5) Run backend (serves the built frontend)
```bash
./.venv/bin/python Backend/hybrid_app.py
```

Open http://127.0.0.1:5000 and search for a city to see visualizations and analysis.

## Notes
- Secrets should be provided via environment variables (see `.env`).
- For production, use the `Dockerfile` or your preferred hosting. 
- Frontend is built with Vite + React; backend is Flask.
