#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Deploy remoto via SSH — executa LOCALMENTE na sua máquina
#
# Uso:
#   bash infra/scripts/deploy-ssh.sh ubuntu@SEU_IP_ORACLE
#
# Pré-requisitos no servidor:
#   - git, docker, docker compose, nginx, node 20+, npm
#   - Repo clonado em /opt/lat-long-caminhoneiro
#   - /var/www/lat-long-web/ criado: sudo mkdir -p /var/www/lat-long-web
#   - .env configurado em /opt/lat-long-caminhoneiro/backend/.env
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SSH_TARGET="${1:?}"
REPO_DIR="/opt/lat-long-caminhoneiro"
WEB_DIR="/var/www/lat-long-web"
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Iniciando deploy em: $SSH_TARGET"
echo ""

ssh -o StrictHostKeyChecking=no "$SSH_TARGET" bash << REMOTE_EOF
set -euo pipefail

echo "──────────────────────────────────────────"
echo "1/6  Limpando o que está rodando"
echo "──────────────────────────────────────────"
cd "${REPO_DIR}"

# Para containers Docker (se existirem)
docker compose -f ${COMPOSE_FILE} down --remove-orphans 2>/dev/null || true

# Para serviço systemd legado (se existir)
sudo systemctl stop lat-long-backend 2>/dev/null && \
  sudo systemctl disable lat-long-backend 2>/dev/null || true

echo "✔  Limpo"

echo "──────────────────────────────────────────"
echo "2/6  Atualizando código"
echo "──────────────────────────────────────────"
git pull origin main
echo "✔  Código atualizado"

echo "──────────────────────────────────────────"
echo "3/6  Build do backend (Docker)"
echo "──────────────────────────────────────────"
docker compose -f ${COMPOSE_FILE} build --no-cache
echo "✔  Imagem construída"

echo "──────────────────────────────────────────"
echo "4/6  Subindo backend"
echo "──────────────────────────────────────────"
docker compose -f ${COMPOSE_FILE} up -d
echo "✔  Backend rodando"

echo "──────────────────────────────────────────"
echo "5/6  Build do web dashboard"
echo "──────────────────────────────────────────"
cd web
npm ci --silent
npm run build
sudo rsync -a --delete dist/ ${WEB_DIR}/
cd ..
echo "✔  Web publicado em ${WEB_DIR}"

echo "──────────────────────────────────────────"
echo "6/6  Recarregando nginx"
echo "──────────────────────────────────────────"
sudo systemctl reload nginx
echo "✔  Nginx recarregado"

echo ""
echo "═══════════════════════════════════════════"
echo "✅  Deploy concluído!"
echo "═══════════════════════════════════════════"
echo ""
echo "Status do backend:"
docker compose -f ${COMPOSE_FILE} ps
echo ""
echo "Últimos logs:"
docker compose -f ${COMPOSE_FILE} logs --tail=20

REMOTE_EOF
