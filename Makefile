.PHONY: setup seed test run backend frontend help

help:
	@echo "CANON: Open-Source Brand Governance Compiler"
	@echo "make setup     - Create venv and install dependencies"
	@echo "make seed      - Populate database with synthetic brand data"
	@echo "make test      - Run automated backend test suite (19 unit & e2e tests)"
	@echo "make backend   - Start FastAPI backend server on :8000"
	@echo "make frontend  - Start Next.js frontend dev server on :3000"

setup:
	cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
	cd frontend && npm install

seed:
	cd backend && .venv/bin/python -m app.seed.synthetic_brand

test:
	cd backend && .venv/bin/pytest tests/ -v

backend:
	cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev -- --port 3000
