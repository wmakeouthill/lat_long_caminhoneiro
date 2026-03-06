#!/usr/bin/env bash
# Deploy completo na Oracle VPS Ubuntu 22.04
# Uso: bash infra/scripts/deploy.sh

set -euo pipefail

REPO_DIR="/opt/lat-long-caminhoneiro"
WEB_DIR="/var/www/lat-long-web"
SERVICE="lat-long-backend"

echo "==> Atualizando código"
cd "$REPO_DIR"
git pull origin main

echo "==> Instalando dependências do backend"
cd "$REPO_DIR/backend"
.venv/bin/pip install poetry --quiet
.venv/bin/poetry install --only main --no-interaction

echo "==> Rodando migrations"
.venv/bin/alembic upgrade head

echo "==> Build do web dashboard"
cd "$REPO_DIR/web"
npm ci --silent
npm run build

echo "==> Publicando web"
sudo mkdir -p "$WEB_DIR"
sudo rsync -a --delete dist/ "$WEB_DIR/"

echo "==> Reiniciando backend"
sudo systemctl restart "$SERVICE"
sudo systemctl status "$SERVICE" --no-pager

echo ""
echo "✅ Deploy concluído!"
