#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Build local → transfere via SSH → limpa VPS → sobe container
#
#  Uso (Git Bash / WSL / Linux / macOS):
#    bash infra/scripts/deploy-local-build.sh
#
#  Não requer Docker Registry nem git no servidor.
#  A imagem é construída localmente e enviada via pipe SSH (sem arquivo temp).
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuração ─────────────────────────────────────────────────────────────
SSH_KEY="CHAVE_SSH_LOCAL"   # Git Bash (Windows)
SSH_HOST="ubuntu@SEU_IP_VPS"
IMAGE_NAME="lat-long-backend"
IMAGE_TAG="latest"
REMOTE_DIR="/opt/lat-long-caminhoneiro"
WEB_DIR="/var/www/lat-long-web"
COMPOSE_FILE="$REMOTE_DIR/docker-compose.deploy.yml"
# ─────────────────────────────────────────────────────────────────────────────

SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=15"
SCP="scp -i $SSH_KEY -o StrictHostKeyChecking=no"

# Corrige permissão da chave (necessário no Linux/macOS; ignorado no Windows NTFS)
chmod 600 "$SSH_KEY" 2>/dev/null || true

separador() { echo ""; echo "── $* ──────────────────────────────────────────"; }

# ── 1. Build da imagem Docker localmente ─────────────────────────────────────
separador "1/5  Build da imagem Docker"
docker build \
  --tag "$IMAGE_NAME:$IMAGE_TAG" \
  --file ./backend/Dockerfile \
  ./backend
echo "✔  Imagem buildada: $IMAGE_NAME:$IMAGE_TAG"

# ── 2. Build do web dashboard localmente ─────────────────────────────────────
separador "2/5  Build do web dashboard"
(cd web && npm ci --silent && npm run build)
echo "✔  Web buildado em web/dist/"

# ── 3. Envia imagem Docker via pipe SSH (sem arquivo temporário) ──────────────
separador "3/5  Transferindo imagem para o VPS"
echo "    Isso pode levar alguns minutos na primeira vez..."
docker save "$IMAGE_NAME:$IMAGE_TAG" \
  | gzip -6 \
  | $SSH "$SSH_HOST" "gunzip | docker load"
echo "✔  Imagem transferida e carregada no VPS"

# ── 4. Envia web/dist + docker-compose.deploy.yml via SSH ────────────────────
separador "4/5  Transferindo arquivos web e compose"

# Envia o docker-compose.deploy.yml
$SCP ./docker-compose.deploy.yml "$SSH_HOST:$REMOTE_DIR/docker-compose.deploy.yml"

# Envia o build do web via tar pipe (sem arquivo temporário)
tar -czC web/dist . \
  | $SSH "$SSH_HOST" \
    "mkdir -p /tmp/lat-long-web-dist && tar -xzC /tmp/lat-long-web-dist && \
     sudo mkdir -p $WEB_DIR && \
     sudo rsync -a --delete /tmp/lat-long-web-dist/ $WEB_DIR/ && \
     rm -rf /tmp/lat-long-web-dist"

echo "✔  Arquivos transferidos"

# ── 5. Limpa tudo no VPS e sobe o novo container ─────────────────────────────
separador "5/5  Deploy no VPS"

$SSH "$SSH_HOST" bash << REMOTE_EOF
set -euo pipefail

echo "→ Parando e removendo containers em execução..."
docker compose -f ${COMPOSE_FILE} down --remove-orphans 2>/dev/null || true

# Para systemd legado caso exista
sudo systemctl stop lat-long-backend 2>/dev/null && \
  sudo systemctl disable lat-long-backend 2>/dev/null || true

echo "→ Removendo imagens antigas (mantém a nova)..."
docker image prune -f 2>/dev/null || true

echo "→ Subindo novo container..."
docker compose -f ${COMPOSE_FILE} up -d

echo "→ Recarregando nginx..."
sudo systemctl reload nginx

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅  Deploy concluído!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Containers rodando:"
docker compose -f ${COMPOSE_FILE} ps
echo ""
echo "Últimos logs do backend:"
docker compose -f ${COMPOSE_FILE} logs --tail=30
REMOTE_EOF
