#!/bin/sh
set -e

echo "[entrypoint] Rodando migrations..."
/app/.venv/bin/alembic upgrade head

echo "[entrypoint] Iniciando servidor..."
exec /app/.venv/bin/uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 1 \
  --no-access-log
