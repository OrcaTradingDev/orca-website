# OrcaTrading Backend (Phase 0)

## Run locally
```bash
cd backend
cp .env.example .env
docker-compose up -d db redis
uvicorn app.main:app --reload
# open http://localhost:8000/healthz

