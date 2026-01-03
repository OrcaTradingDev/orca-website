# Orca Trading — Backend

FastAPI backend powering the Orca FX/Crypto/Stocks screener.

This service is responsible for:
- Market data storage (Postgres)
- Screening APIs
- Background refresh jobs (Redis + workers)
- Future metrics, auth, and billing

---

## Tech Stack

- **Python** 3.10+
- **FastAPI**
- **PostgreSQL** (async via `asyncpg`)
- **SQLAlchemy 2.0**
- **Alembic** (migrations)
- **Redis** (job queue)
- **Docker / docker-compose** (infra)

---

## Folder Structure

backend/
app/
main.py
core/
db.py
redis.py
jobs.py
logging.py
models/
fx_universe.py
market_prices.py
routers/
screener.py
health.py
alembic/
scripts/
seed_fx_universe.py
worker/
refresh_worker.py
docker-compose.yml
alembic.ini
requirements.txt
.env.example

---

## Local Development Setup

### 1. Create virtual environment

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
